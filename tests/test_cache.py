"""Unit tests for the 30-minute caching mechanism and fallback behavior."""

from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
import requests
from data.air_quality import AirQualityService, AirReading


def test_cache_returns_cached_reading_within_ttl():
    """Test that requests within 30 minutes return cached data without refetching."""
    service = AirQualityService(cache_ttl_seconds=1800)

    # First fetch returns live reading
    mock_payload = {
        "current": {
            "time": "2026-11-24T12:00",
            "us_aqi": 220,
            "pm2_5": 140.0,
            "nitrogen_dioxide": 45.0,
        }
    }

    with patch("requests.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.json.return_value = mock_payload
        mock_resp.raise_for_status = MagicMock()
        mock_get.return_value = mock_resp

        first_reading = service.get_air_quality()
        assert first_reading.aqi == 220
        assert first_reading.is_cached is False
        assert mock_get.call_count == 1

        # Second fetch 5 minutes later should return cached copy without calling requests.get
        second_reading = service.get_air_quality()
        assert second_reading.aqi == 220
        assert second_reading.is_cached is True
        assert "Cached reading" in second_reading.source_label
        assert mock_get.call_count == 1  # No additional network call made!


def test_cache_refreshes_after_ttl_expires():
    """Test that cache refreshes from network once TTL (30 minutes) expires."""
    service = AirQualityService(cache_ttl_seconds=1800)

    mock_payload_1 = {
        "current": {
            "time": "2026-11-24T12:00",
            "us_aqi": 210,
            "pm2_5": 130.0,
            "nitrogen_dioxide": 40.0,
        }
    }
    mock_payload_2 = {
        "current": {
            "time": "2026-11-24T12:35",
            "us_aqi": 285,
            "pm2_5": 190.0,
            "nitrogen_dioxide": 60.0,
        }
    }

    with patch("requests.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()

        # First call at t0
        mock_resp.json.return_value = mock_payload_1
        mock_get.return_value = mock_resp
        reading_1 = service.get_air_quality()
        assert reading_1.aqi == 210

        # Simulate time jump of 31 minutes
        service._cached_at = datetime.now(timezone.utc) - timedelta(minutes=31)

        mock_resp.json.return_value = mock_payload_2
        reading_2 = service.get_air_quality()
        assert reading_2.aqi == 285
        assert reading_2.is_cached is False
        assert mock_get.call_count == 2


def test_fallback_to_last_saved_reading_when_fetch_fails():
    """Test that network error falls back to last saved reading with its timestamp."""
    service = AirQualityService(cache_ttl_seconds=60)

    # Initial successful fetch
    service._last_saved_reading = AirReading(
        aqi=230,
        pm2_5=150.0,
        no2=45.0,
        dominant_pollutant="PM2.5",
        category="Very Poor",
        status_color="#C0392B",
        timestamp="Nov 24, 2026 12:00 PM",
        source_label="Live data (Open-Meteo)",
    )
    # Expire the cache so it attempts to fetch
    service._cached_at = datetime.now(timezone.utc) - timedelta(hours=2)

    with patch("requests.get", side_effect=requests.RequestException("Connection error")):
        reading = service.get_air_quality()
        assert reading.aqi == 230
        assert "Last saved reading" in reading.source_label
        assert "Nov 24, 2026 12:00 PM" in reading.source_label


def test_fallback_to_sample_data_when_no_prior_reading():
    """Test fallback to sample data labeled 'Sample data' if initial fetch fails completely."""
    service = AirQualityService()

    with patch("requests.get", side_effect=requests.RequestException("Offline")):
        reading = service.get_air_quality()
        assert reading.is_sample is True
        assert reading.source_label == "Sample data"
        assert reading.aqi > 0

