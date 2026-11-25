"""Unit tests for air quality data parsing, dominant pollutant calculations, and categories."""

import pytest
from data.air_quality import (
    parse_air_quality_payload,
    get_aqi_category_and_color,
    calculate_dominant_pollutant,
    SAMPLE_READING,
    AirReading,
)


def test_aqi_category_and_color():
    """Verify US AQI level mapping to plain-language labels and WCAG colors."""
    cat, col = get_aqi_category_and_color(30)
    assert cat == "Good"
    assert col == "#2E7D32"

    cat, col = get_aqi_category_and_color(85)
    assert cat == "Moderate"
    assert col == "#B8860B"

    cat, col = get_aqi_category_and_color(160)
    assert cat == "Poor"
    assert col == "#D96B27"

    cat, col = get_aqi_category_and_color(240)
    assert cat == "Very Poor"
    assert col == "#C0392B"

    cat, col = get_aqi_category_and_color(380)
    assert cat == "Hazardous"
    assert col == "#6C3483"


def test_calculate_dominant_pollutant():
    """Test dominant pollutant determination between PM2.5 and NO2."""
    # High PM2.5 scenario (typical Delhi winter smog)
    assert calculate_dominant_pollutant(pm2_5=180.0, no2=40.0) == "PM2.5"

    # High NO2 traffic scenario
    assert calculate_dominant_pollutant(pm2_5=10.0, no2=95.0) == "NO2"

    # Boundary check
    assert calculate_dominant_pollutant(pm2_5=0.0, no2=0.0) == "PM2.5"


def test_parse_air_quality_payload_success():
    """Test parsing standard Open-Meteo payload with 'current' object."""
    payload = {
        "latitude": 28.61,
        "longitude": 77.21,
        "current": {
            "time": "2026-11-24T14:00",
            "us_aqi": 265,
            "pm2_5": 175.4,
            "nitrogen_dioxide": 52.1,
        },
    }

    reading = parse_air_quality_payload(payload)
    assert isinstance(reading, AirReading)
    assert reading.aqi == 265
    assert reading.category == "Very Poor"
    assert reading.dominant_pollutant == "PM2.5"
    assert reading.pm2_5 == 175.4
    assert reading.no2 == 52.1
    assert reading.is_sample is False
    assert reading.source_label == "Live data (Open-Meteo)"


def test_parse_air_quality_payload_hourly_fallback():
    """Test fallback parsing when 'current' is missing but 'hourly' is provided."""
    payload = {
        "latitude": 28.61,
        "longitude": 77.21,
        "hourly": {
            "time": ["2026-11-24T12:00", "2026-11-24T13:00"],
            "us_aqi": [180, 210],
            "pm2_5": [95.0, 140.0],
            "nitrogen_dioxide": [60.0, 85.0],
        },
    }

    reading = parse_air_quality_payload(payload)
    assert reading.aqi == 210
    assert reading.category == "Very Poor"
    assert reading.pm2_5 == 140.0


def test_parse_air_quality_payload_invalid():
    """Test error handling with corrupted or empty payload."""
    with pytest.raises(ValueError):
        parse_air_quality_payload({})

    with pytest.raises(ValueError):
        parse_air_quality_payload({"current": {"us_aqi": None}})


def test_sample_reading_format():
    """Verify built-in sample reading meets PRD requirements."""
    assert SAMPLE_READING.is_sample is True
    assert SAMPLE_READING.source_label == "Sample data"
    assert SAMPLE_READING.aqi > 0
    assert SAMPLE_READING.dominant_pollutant in ["PM2.5", "NO2"]

