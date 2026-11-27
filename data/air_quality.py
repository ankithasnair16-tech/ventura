"""Air quality data retrieval, parsing, and caching for Ventura.

Primary source: WAQI (World Air Quality Index) API — real monitoring station data.
Fallback source: Open-Meteo Air Quality API — model-interpolated, keyless.
Falls back further to last cached reading or built-in sample data on total failure.
"""

from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
import logging
import os
from pathlib import Path
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Delhi Coordinates
DELHI_LATITUDE: float = 28.61
DELHI_LONGITUDE: float = 77.21

# Open-Meteo (fallback / secondary source — no key required)
OPEN_METEO_AQ_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"

# WAQI (primary source — requires free token from https://aqicn.org/data-platform/token/)
WAQI_BASE_URL: str = "https://api.waqi.info/feed"


def _load_waqi_token() -> str:
    """Read WAQI_TOKEN from environment or project .env without extra dependencies."""
    env_val = os.getenv("WAQI_TOKEN", "").strip()
    if env_val:
        return env_val
    if os.getenv("PYTEST_CURRENT_TEST"):
        return ""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    try:
        if env_path.is_file():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                stripped = line.strip()
                if not stripped or stripped.startswith("#") or "=" not in stripped:
                    continue
                key, val = stripped.split("=", 1)
                if key.strip() == "WAQI_TOKEN":
                    return val.strip().strip('"').strip("'")
    except Exception as exc:
        logger.warning("Could not read .env for WAQI_TOKEN: %s", exc)
    return ""


WAQI_TOKEN: str = os.getenv("WAQI_TOKEN", "")

DEFAULT_CACHE_TTL_SECONDS: int = 1800  # 30 minutes


@dataclass
class AirReading:
    """Represents a validated air quality reading."""
    aqi: int
    pm2_5: float
    no2: float
    dominant_pollutant: str
    category: str
    status_color: str
    timestamp: str
    source_label: str
    is_sample: bool = False
    is_cached: bool = False


# Built-in sample reading for offline/demo fallback
SAMPLE_READING = AirReading(
    aqi=245,
    pm2_5=168.5,
    no2=48.2,
    dominant_pollutant="PM2.5",
    category="Very Poor",
    status_color="#C0392B",  # Red
    timestamp="Demo Baseline",
    source_label="Sample data",
    is_sample=True,
    is_cached=False,
)


def get_aqi_category_and_color(aqi: int) -> tuple[str, str]:
    """Map US AQI value to plain-language label and WCAG-compliant color.

    Design PRD colors:
    - Green for good (0-50)
    - Yellow for moderate (51-100)
    - Orange for poor (101-200)
    - Red for very poor (201-300)
    - Purple for hazardous (301+)
    """
    if aqi <= 50:
        return "Good", "#2E7D32"      # Earthy Forest Green
    elif aqi <= 100:
        return "Moderate", "#B8860B"  # Earthy Golden Yellow
    elif aqi <= 200:
        return "Poor", "#D96B27"      # Terracotta Orange
    elif aqi <= 300:
        return "Very Poor", "#C0392B" # Clay Red
    else:
        return "Hazardous", "#6C3483" # Deep Plum / Purple


def calculate_dominant_pollutant(pm2_5: float, no2: float) -> str:
    """Determine dominant pollutant based on standard health impact thresholds.

    Baseline ratio against national 24-hr standards (PM2.5: 35 µg/m³, NO2: 80 µg/m³).
    """
    pm2_5_ratio = max(pm2_5, 0.0) / 35.0
    no2_ratio = max(no2, 0.0) / 80.0
    return "PM2.5" if pm2_5_ratio >= no2_ratio else "NO2"


def parse_waqi_payload(payload: Dict[str, Any]) -> AirReading:
    """Parse a WAQI API JSON response into an AirReading instance.

    WAQI response structure:
        {
            "status": "ok",
            "data": {
                "aqi": 183,
                "iaqi": {
                    "pm25": {"v": 72.5},
                    "no2":  {"v": 15.3}
                },
                "time": {"s": "2026-11-27 12:00:00"}
            }
        }
    Raises ValueError for any missing or invalid field so the caller can
    fall back cleanly to Open-Meteo without exposing the error to users.
    """
    if not isinstance(payload, dict):
        raise ValueError("WAQI: payload is not a dict")

    if payload.get("status") != "ok":
        message = payload.get("data", "Unknown WAQI error")
        raise ValueError(f"WAQI: non-ok status – {message}")

    data = payload.get("data")
    if not isinstance(data, dict):
        raise ValueError("WAQI: missing 'data' object")

    aqi_raw = data.get("aqi")
    if aqi_raw is None or not str(aqi_raw).lstrip("-").isdigit():
        raise ValueError(f"WAQI: invalid or missing aqi field: {aqi_raw!r}")

    aqi = int(aqi_raw)

    iaqi = data.get("iaqi", {})
    pm2_5 = float(iaqi.get("pm25", {}).get("v", 0.0))
    no2 = float(iaqi.get("no2", {}).get("v", 0.0))

    time_info = data.get("time", {})
    time_str = time_info.get("s", "") if isinstance(time_info, dict) else ""
    if time_str:
        try:
            dt = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
            formatted_time = dt.strftime("%b %d, %Y %I:%M %p")
        except Exception:
            formatted_time = time_str
    else:
        formatted_time = datetime.now().strftime("%b %d, %Y %I:%M %p")

    category, status_color = get_aqi_category_and_color(aqi)
    dominant = calculate_dominant_pollutant(pm2_5, no2)

    return AirReading(
        aqi=aqi,
        pm2_5=pm2_5,
        no2=no2,
        dominant_pollutant=dominant,
        category=category,
        status_color=status_color,
        timestamp=formatted_time,
        source_label="Live data (WAQI)",
        is_sample=False,
        is_cached=False,
    )


def parse_air_quality_payload(payload: Dict[str, Any]) -> AirReading:
    """Parse raw Open-Meteo JSON payload into an AirReading instance."""
    if not isinstance(payload, dict):
        raise ValueError("Invalid payload: expected dictionary")

    # Open-Meteo returns 'current' object when queried with current=...
    current = payload.get("current")
    if not isinstance(current, dict):
        # Fallback to 'hourly' if present
        hourly = payload.get("hourly")
        if isinstance(hourly, dict) and "us_aqi" in hourly:
            aqi_list = hourly.get("us_aqi", [])
            pm2_5_list = hourly.get("pm2_5", [])
            no2_list = hourly.get("nitrogen_dioxide", [])
            time_list = hourly.get("time", [])
            idx = -1
            aqi_val = aqi_list[idx] if aqi_list else 0
            pm2_5_val = pm2_5_list[idx] if pm2_5_list else 0.0
            no2_val = no2_list[idx] if no2_list else 0.0
            time_val = time_list[idx] if time_list else ""
            current = {
                "us_aqi": aqi_val,
                "pm2_5": pm2_5_val,
                "nitrogen_dioxide": no2_val,
                "time": time_val
            }
        else:
            raise ValueError("Payload missing 'current' or 'hourly' air quality metrics")

    aqi_raw = current.get("us_aqi")
    pm2_5_raw = current.get("pm2_5")
    no2_raw = current.get("nitrogen_dioxide")

    if aqi_raw is None or pm2_5_raw is None or no2_raw is None:
        raise ValueError("Missing essential pollutant data (us_aqi, pm2_5, or nitrogen_dioxide)")

    aqi = int(round(float(aqi_raw)))
    pm2_5 = float(pm2_5_raw)
    no2 = float(no2_raw)

    time_str = current.get("time", "")
    if time_str:
        try:
            # Parse ISO time
            dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            formatted_time = dt.strftime("%b %d, %Y %I:%M %p")
        except Exception:
            formatted_time = str(time_str)
    else:
        now = datetime.now()
        formatted_time = now.strftime("%b %d, %Y %I:%M %p")

    category, status_color = get_aqi_category_and_color(aqi)
    dominant = calculate_dominant_pollutant(pm2_5, no2)

    return AirReading(
        aqi=aqi,
        pm2_5=pm2_5,
        no2=no2,
        dominant_pollutant=dominant,
        category=category,
        status_color=status_color,
        timestamp=formatted_time,
        source_label="Live data (Open-Meteo)",
        is_sample=False,
        is_cached=False,
    )


class AirQualityService:
    """Manages fetching, caching (30 minutes), and fallbacks for air quality data.

    Fetch priority:
      1. 30-minute in-memory cache (default Delhi only).
      2. WAQI live station data (primary – requires WAQI_TOKEN env var).
      3. Open-Meteo model data (secondary fallback – keyless).
      4. Last saved reading (tertiary fallback).
      5. Built-in sample reading (final fallback – always available).
    """

    def __init__(self, cache_ttl_seconds: Optional[int] = None):
        if cache_ttl_seconds is None:
            env_ttl = os.getenv("VENTURA_CACHE_TTL_SECONDS")
            try:
                self.cache_ttl_seconds = int(env_ttl) if env_ttl else DEFAULT_CACHE_TTL_SECONDS
            except ValueError:
                self.cache_ttl_seconds = DEFAULT_CACHE_TTL_SECONDS
        else:
            self.cache_ttl_seconds = cache_ttl_seconds

        self._cached_reading: Optional[AirReading] = None
        self._cached_at: Optional[datetime] = None
        self._last_saved_reading: Optional[AirReading] = None
        self._last_saved_at: Optional[datetime] = None

    def get_air_quality(
        self,
        force_refresh: bool = False,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> AirReading:
        """Retrieve current air quality, honoring cache, fallback, and sample modes.
        
        If latitude and longitude are specified, fetches air quality for that coordinate.
        """
        now = datetime.now(timezone.utc)
        target_lat = latitude if latitude is not None else DELHI_LATITUDE
        target_lon = longitude if longitude is not None else DELHI_LONGITUDE
        is_custom_coords = (latitude is not None and longitude is not None)

        # 1. Check cache validity (only for default Delhi location to avoid cross-city cache hits)
        if not is_custom_coords and not force_refresh and self._cached_reading is not None and self._cached_at is not None:
            elapsed = (now - self._cached_at).total_seconds()
            if elapsed < self.cache_ttl_seconds:
                # Return cached reading marked as cached
                return AirReading(
                    aqi=self._cached_reading.aqi,
                    pm2_5=self._cached_reading.pm2_5,
                    no2=self._cached_reading.no2,
                    dominant_pollutant=self._cached_reading.dominant_pollutant,
                    category=self._cached_reading.category,
                    status_color=self._cached_reading.status_color,
                    timestamp=self._cached_reading.timestamp,
                    source_label=f"Cached reading ({int(elapsed // 60)}m ago)",
                    is_sample=self._cached_reading.is_sample,
                    is_cached=True,
                )

        # 2. Try WAQI first (primary – real monitoring station data)
        try:
            reading = self._fetch_waqi_data(latitude=target_lat, longitude=target_lon)
            if not is_custom_coords:
                self._cached_reading = reading
                self._cached_at = now
                self._last_saved_reading = reading
                self._last_saved_at = now
            return reading
        except Exception as exc:
            logger.warning("WAQI fetch failed, falling back to Open-Meteo: %s", exc)

        # 3. Fetch fresh live reading from Open-Meteo (secondary fallback)
        # 3. Fetch fresh live reading from Open-Meteo (secondary fallback)
        try:
            reading = self._fetch_live_data(latitude=target_lat, longitude=target_lon)
            if not is_custom_coords:
                # Update cache and last saved reading for default Delhi
                self._cached_reading = reading
                self._cached_at = now
                self._last_saved_reading = reading
                self._last_saved_at = now
            return reading
        except Exception as exc:
            logger.warning("Failed to fetch live air quality from Open-Meteo: %s", exc)

        # 3. Fallback to last saved reading if available
        if self._last_saved_reading is not None:
            saved_time_label = self._last_saved_reading.timestamp
            return AirReading(
                aqi=self._last_saved_reading.aqi,
                pm2_5=self._last_saved_reading.pm2_5,
                no2=self._last_saved_reading.no2,
                dominant_pollutant=self._last_saved_reading.dominant_pollutant,
                category=self._last_saved_reading.category,
                status_color=self._last_saved_reading.status_color,
                timestamp=self._last_saved_reading.timestamp,
                source_label=f"Last saved reading ({saved_time_label})",
                is_sample=False,
                is_cached=True,
            )

        # 4. Fallback to built-in sample data
        now_local = datetime.now()
        sample = AirReading(
            aqi=SAMPLE_READING.aqi,
            pm2_5=SAMPLE_READING.pm2_5,
            no2=SAMPLE_READING.no2,
            dominant_pollutant=SAMPLE_READING.dominant_pollutant,
            category=SAMPLE_READING.category,
            status_color=SAMPLE_READING.status_color,
            timestamp=now_local.strftime("%b %d, %Y %I:%M %p"),
            source_label="Sample data",
            is_sample=True,
            is_cached=False,
        )
        return sample

    def _fetch_waqi_data(
        self,
        latitude: float,
        longitude: float,
    ) -> AirReading:
        """Call the WAQI geo endpoint for any lat/lon coordinate.

        Raises an exception (ValueError, requests.RequestException, etc.) on any
        failure so the caller can fall back to Open-Meteo transparently.
        """
        token = WAQI_TOKEN or _load_waqi_token()
        if not token:
            raise ValueError("WAQI_TOKEN is not configured – skipping to Open-Meteo")

        url = f"{WAQI_BASE_URL}/geo:{latitude};{longitude}/?token={token}"
        response = requests.get(url, timeout=7)
        response.raise_for_status()
        payload = response.json()
        return parse_waqi_payload(payload)

    def _fetch_live_data(
        self,
        latitude: float = DELHI_LATITUDE,
        longitude: float = DELHI_LONGITUDE,
    ) -> AirReading:
        """Call Open-Meteo Air Quality API with given coordinates."""
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "us_aqi,pm2_5,nitrogen_dioxide",
            "timezone": "auto",
        }
        response = requests.get(OPEN_METEO_AQ_URL, params=params, timeout=7)
        response.raise_for_status()
        payload = response.json()
        return parse_air_quality_payload(payload)

