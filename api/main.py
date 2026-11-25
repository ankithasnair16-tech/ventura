"""Ventura FastAPI Application.

Provides REST endpoints for live air-quality data and personalized clean-air
recommendations, reusing the existing Ventura data and rules modules.
"""

from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Set
import logging
import os

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from data.air_quality import AirQualityService, AirReading
from rules.advice_rules import AdviceItem, get_personalized_plan

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ventura_api")

# Singleton instance of AirQualityService (30-minute caching shared across requests)
air_service = AirQualityService()


# ---------------------------------------------------------------------------
# Pydantic Request & Response Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "ventura-api"
    version: str = "1.0.0"


class AirQualityResponse(BaseModel):
    aqi: int = Field(..., description="US Air Quality Index value")
    pm2_5: float = Field(..., description="PM2.5 concentration in µg/m³")
    no2: float = Field(..., description="NO2 concentration in µg/m³")
    dominant_pollutant: str = Field(..., description="Dominant pollutant (PM2.5 or NO2)")
    category: str = Field(..., description="Plain-language level (e.g. Good, Poor, Very Poor)")
    status_color: str = Field(..., description="WCAG-compliant status color hex")
    timestamp: str = Field(..., description="Formatted reading timestamp")
    source_label: str = Field(..., description="Data provenance label")
    is_sample: bool = Field(False, description="Whether reading is baseline demo sample")
    is_cached: bool = Field(False, description="Whether reading was served from cache")


class PlanRequest(BaseModel):
    household: str = Field(
        ...,
        description="Household demographic",
        examples=["Family with children", "Just me", "Older adults at home", "Someone with asthma"],
    )
    travel: str = Field(
        ...,
        description="Commute mode",
        examples=["Car or two-wheeler", "Public transport", "Walk or cycle", "Mostly work from home"],
    )
    cooking: str = Field(
        ...,
        description="Cooking fuel/appliance",
        examples=["LPG or gas", "Induction or electric", "Wood or coal", "Not sure"],
    )
    outdoor_time: str = Field(
        ...,
        description="Daily outdoor exposure",
        examples=["Little", "Some", "A lot"],
    )
    dismissed_ids: Optional[List[str]] = Field(
        default_factory=list,
        description="List of tip IDs dismissed with 'Not for me'",
    )
    dominant_pollutant: Optional[str] = Field(
        None,
        description="Optional dominant pollutant override (defaults to current live reading)",
    )


class AdviceItemResponse(BaseModel):
    id: str
    area: str
    tip: str
    impact_level: str
    detail: str
    dominant_pollutant: str
    tag: str
    is_highlighted: bool = False


class PlanResponse(BaseModel):
    dominant_pollutant: str
    areas: Dict[str, List[AdviceItemResponse]]


# ---------------------------------------------------------------------------
# FastAPI Application & Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Ventura FastAPI Backend...")
    yield
    logger.info("Shutting down Ventura FastAPI Backend...")


app = FastAPI(
    title="Ventura API",
    description="Clean Air & Smog Adaptation REST API for Delhi",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Configuration (React / Vite Local Development)
# ---------------------------------------------------------------------------

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global Error Handler (Never expose stack traces or secrets)
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled API error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def get_health():
    """Simple health check endpoint."""
    return HealthResponse()


@app.get("/api/air-quality", response_model=AirQualityResponse, tags=["Air Quality"])
def get_air_quality(force_refresh: bool = False):
    """Retrieve current Delhi air quality from Open-Meteo with 30-min cache & fallback."""
    try:
        reading: AirReading = air_service.get_air_quality(force_refresh=force_refresh)
        return AirQualityResponse(
            aqi=reading.aqi,
            pm2_5=reading.pm2_5,
            no2=reading.no2,
            dominant_pollutant=reading.dominant_pollutant,
            category=reading.category,
            status_color=reading.status_color,
            timestamp=reading.timestamp,
            source_label=reading.source_label,
            is_sample=reading.is_sample,
            is_cached=reading.is_cached,
        )
    except Exception as exc:
        logger.error("Error retrieving air quality in endpoint: %s", exc)
        # Attempt safe sample fallback
        sample = air_service.get_air_quality(force_refresh=False)
        return AirQualityResponse(
            aqi=sample.aqi,
            pm2_5=sample.pm2_5,
            no2=sample.no2,
            dominant_pollutant=sample.dominant_pollutant,
            category=sample.category,
            status_color=sample.status_color,
            timestamp=sample.timestamp,
            source_label=sample.source_label,
            is_sample=True,
            is_cached=False,
        )


@app.post("/api/plan", response_model=PlanResponse, tags=["Personal Plan"])
def generate_plan(request: PlanRequest):
    """Generate categorized, personalized recommendations using existing rules engine.

    Returns the four required areas in strict PRD order:
    1. sustainable_alternatives (highlighted)
    2. daily_routines
    3. indoor_hacks
    4. action_impacts
    """
    try:
        # Determine dominant pollutant if not explicitly provided
        dom_pollutant = request.dominant_pollutant
        if not dom_pollutant:
            current_reading = air_service.get_air_quality()
            dom_pollutant = current_reading.dominant_pollutant

        answers = {
            "household": request.household,
            "travel": request.travel,
            "cooking": request.cooking,
            "outdoor_time": request.outdoor_time,
        }
        dismissed_set: Set[str] = set(request.dismissed_ids or [])

        # Call the existing rules module
        plan_dict: Dict[str, List[AdviceItem]] = get_personalized_plan(
            dominant_pollutant=dom_pollutant,
            answers=answers,
            dismissed_ids=dismissed_set,
        )

        # Map to response schema
        formatted_areas: Dict[str, List[AdviceItemResponse]] = {}
        for area_key, items in plan_dict.items():
            formatted_areas[area_key] = [
                AdviceItemResponse(
                    id=item.id,
                    area=item.area,
                    tip=item.tip,
                    impact_level=item.impact_level,
                    detail=item.detail,
                    dominant_pollutant=item.dominant_pollutant,
                    tag=item.tag,
                    is_highlighted=item.is_highlighted,
                )
                for item in items
            ]

        return PlanResponse(
            dominant_pollutant=dom_pollutant,
            areas=formatted_areas,
        )
    except Exception as exc:
        logger.error("Error generating personalized plan: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations. Please check inputs and retry.",
        )
