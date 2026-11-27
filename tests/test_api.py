"""Unit and integration tests for the Ventura FastAPI backend."""

from fastapi.testclient import TestClient
import pytest
from api.main import app

client = TestClient(app)


def test_get_health():
    """Verify health endpoint returns status 200 and standard payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ventura-api"
    assert "version" in data


def test_get_air_quality():
    """Verify air-quality endpoint returns valid data schema and values."""
    response = client.get("/api/air-quality")
    assert response.status_code == 200
    data = response.json()

    assert "aqi" in data
    assert isinstance(data["aqi"], int)
    assert data["aqi"] > 0
    assert "pm2_5" in data
    assert isinstance(data["pm2_5"], (int, float))
    assert "no2" in data
    assert isinstance(data["no2"], (int, float))
    assert data["dominant_pollutant"] in ["PM2.5", "NO2"]
    assert data["category"] in ["Good", "Moderate", "Poor", "Very Poor", "Hazardous"]
    assert "status_color" in data
    assert data["status_color"].startswith("#")
    assert "timestamp" in data
    assert "source_label" in data


def test_post_plan_success():
    """Verify plan endpoint accepts four assessment answers and returns structured recommendations."""
    payload = {
        "household": "Family with children",
        "travel": "Car or two-wheeler",
        "cooking": "LPG or gas",
        "outdoor_time": "Some",
    }
    response = client.post("/api/plan", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "dominant_pollutant" in data
    assert "areas" in data
    areas = data["areas"]

    # Strict PRD area keys required
    expected_areas = [
        "sustainable_alternatives",
        "daily_routines",
        "indoor_hacks",
        "action_impacts",
    ]
    for area_key in expected_areas:
        assert area_key in areas
        assert len(areas[area_key]) > 0
        for item in areas[area_key]:
            assert "id" in item
            assert "tip" in item
            assert "impact_level" in item
            assert item["impact_level"] in ["High", "Medium", "Low"]
            assert "detail" in item

    # Verify sustainable alternatives is highlighted
    for item in areas["sustainable_alternatives"]:
        assert item["is_highlighted"] is True


def test_post_plan_with_dismissal():
    """Verify that dismissed tip IDs are filtered out of the returned plan."""
    # First get initial plan to obtain an ID
    initial_res = client.post(
        "/api/plan",
        json={
            "household": "Family with children",
            "travel": "Car or two-wheeler",
            "cooking": "LPG or gas",
            "outdoor_time": "Some",
        },
    )
    first_item_id = initial_res.json()["areas"]["sustainable_alternatives"][0]["id"]

    # Now request with dismissed_ids
    dismiss_res = client.post(
        "/api/plan",
        json={
            "household": "Family with children",
            "travel": "Car or two-wheeler",
            "cooking": "LPG or gas",
            "outdoor_time": "Some",
            "dismissed_ids": [first_item_id],
        },
    )
    assert dismiss_res.status_code == 200
    returned_sa_ids = [
        item["id"]
        for item in dismiss_res.json()["areas"]["sustainable_alternatives"]
    ]
    assert first_item_id not in returned_sa_ids


def test_post_plan_with_new_questionnaire():
    """Verify plan endpoint accepts the 3 new questions and responds with recommendations."""
    payload = {
        "focus": "Staying safer when I'm outdoors",
        "household": "Just me",
        "routine": "Spending lots of time outdoors",
    }
    response = client.post("/api/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "areas" in data
    # Mask tip should be present in sustainable alternatives for outdoors focus
    sa_tips = [t["tip"] for t in data["areas"]["sustainable_alternatives"]]
    assert any("mask" in t.lower() for t in sa_tips)


def test_post_plan_validation_error():
    """Verify that missing required household demographic triggers a 422 Unprocessable Entity."""
    # Missing required 'household'
    invalid_payload = {
        "focus": "Protecting my family",
        "routine": "Mostly indoors",
    }
    response = client.post("/api/plan", json=invalid_payload)
    assert response.status_code == 422


def test_cors_headers_for_react_dev_server():
    """Verify CORS headers permit local React development server."""
    origin = "http://localhost:5173"
    response = client.get(
        "/api/health",
        headers={"Origin": origin},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin


def test_ask_ventura_offline_fallback():
    """Verify /api/ask-ventura returns valid SSE reply and cards without an API key."""
    import json

    payload = {
        "message": "How can I commute with less exposure today?",
        "history": [],
        "airQuality": {"aqi": 180, "mainPollutant": "PM2.5", "zoneName": "Delhi"},
        "profile": {"household": "Just me"},
        "fast": False,
    }
    response = client.post("/api/ask-ventura", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    data_line = next(
        (line for line in response.text.splitlines() if line.startswith("data: ")),
        "",
    )
    assert data_line
    parsed = json.loads(data_line[6:])
    assert parsed["type"] == "done"
    assert isinstance(parsed["reply"], str) and len(parsed["reply"]) > 0
    assert isinstance(parsed["cards"], list) and len(parsed["cards"]) >= 1
    assert {"title", "explanation", "benefit", "impact", "category"} <= set(parsed["cards"][0].keys())


def test_ask_ventura_groq_error_falls_back_cleanly(monkeypatch):
    """Verify /api/ask-ventura never crashes when Groq API fails."""
    import json
    from unittest.mock import patch

    monkeypatch.setenv("GROQ_API_KEY", "gsk_test_dummy_key")
    with patch("requests.post", side_effect=RuntimeError("network error")):
        response = client.post(
            "/api/ask-ventura",
            json={"message": "What mask seals best for winter smog?"},
        )
    assert response.status_code == 200
    data_line = next(
        (line for line in response.text.splitlines() if line.startswith("data: ")),
        "",
    )
    parsed = json.loads(data_line[6:])
    assert parsed["type"] == "done"
    assert len(parsed["reply"]) > 0
    assert len(parsed["cards"]) >= 1
