"""Ventura FastAPI Application.

Provides REST endpoints for live air-quality data and personalized clean-air
recommendations, reusing the existing Ventura data and rules modules.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
import json
import logging
import os
import requests

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from data.air_quality import AirQualityService, AirReading
from rules.advice_rules import AdviceItem, get_personalized_plan
from data.curated_ideas import CURATED_EXPLORE_IDEAS

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
    # Question 1: What matters most to you right now?
    focus: Optional[str] = Field(
        None,
        description="Core priority/focus",
        examples=[
            "Protecting my family",
            "Staying safer when I'm outdoors",
            "Keeping the air at home cleaner",
            "Making healthier everyday choices",
        ],
    )
    # Question 2: Who should Ventura keep in mind when creating your plan?
    household: str = Field(
        ...,
        description="Household / person context",
        examples=[
            "Just me",
            "Children",
            "Older adults",
            "Someone with breathing sensitivities",
            "My whole household",
        ],
    )
    # Question 3: What does a typical day look like for you?
    routine: Optional[str] = Field(
        None,
        description="Typical daily schedule/routine",
        examples=[
            "Mostly indoors",
            "Commuting around the city",
            "Spending lots of time outdoors",
            "A mix of everything",
        ],
    )
    # Backwards-compatibility fields for legacy Streamlit test runs
    travel: Optional[str] = Field(
        None,
        description="Legacy travel mode for backward compatibility",
    )
    cooking: Optional[str] = Field(
        None,
        description="Legacy cooking mode for backward compatibility",
    )
    outdoor_time: Optional[str] = Field(
        None,
        description="Legacy outdoor exposure for backward compatibility",
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


class ExploreMoreRequest(BaseModel):
    category: Optional[str] = "all"
    existingTitles: Optional[List[str]] = Field(default_factory=list)
    profile: Optional[Dict[str, Any]] = None
    airQuality: Optional[Dict[str, Any]] = None


class ExploreMoreCard(BaseModel):
    id: str
    category: str
    title: str
    summary: str
    detail: Optional[str] = ""
    impactLevel: Optional[str] = "High"
    impact: Optional[str] = "high"
    tag: Optional[str] = ""
    kicker: Optional[str] = ""
    benefit: Optional[str] = ""
    steps: Optional[List[str]] = Field(default_factory=list)
    swapFrom: Optional[str] = ""
    swapTo: Optional[str] = ""
    timeToSeeImpact: Optional[str] = ""
    effort: Optional[str] = ""
    difficulty: Optional[str] = ""
    cost: Optional[str] = ""
    costTier: Optional[str] = ""


class ExploreMoreResponse(BaseModel):
    cards: List[ExploreMoreCard]


class AskVenturaRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    airQuality: Optional[Dict[str, Any]] = None
    profile: Optional[Dict[str, Any]] = None
    fast: Optional[bool] = False


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

# Simple health check endpoint
@app.get("/health", response_model=dict)
def health():
    return {"status": "ok"}


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
def get_air_quality(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    zone: Optional[str] = None,
    name: Optional[str] = None,
    force_refresh: bool = False,
    refresh: Optional[str] = None,
):
    """Retrieve current air quality from Open-Meteo with caching & fallback.
    
    Accepts optional latitude and longitude coordinates for any city worldwide.
    """
    should_refresh = force_refresh or (refresh in ("1", "true", "yes"))
    try:
        reading: AirReading = air_service.get_air_quality(
            force_refresh=should_refresh,
            latitude=lat,
            longitude=lon,
        )
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


# Known Popular Indian & Global Cities for fast instant search
POPULAR_CITIES: List[Dict[str, Any]] = [
    {"id": "delhi-central", "name": "Delhi (Connaught Place)", "lat": 28.63, "lon": 77.22},
    {"id": "mumbai", "name": "Mumbai, Maharashtra", "lat": 19.07, "lon": 72.87},
    {"id": "bengaluru", "name": "Bengaluru, Karnataka", "lat": 12.97, "lon": 77.59},
    {"id": "kolkata", "name": "Kolkata, West Bengal", "lat": 22.57, "lon": 88.36},
    {"id": "chennai", "name": "Chennai, Tamil Nadu", "lat": 13.08, "lon": 80.27},
    {"id": "hyderabad", "name": "Hyderabad, Telangana", "lat": 17.38, "lon": 78.48},
    {"id": "pune", "name": "Pune, Maharashtra", "lat": 18.52, "lon": 73.85},
    {"id": "ahmedabad", "name": "Ahmedabad, Gujarat", "lat": 23.02, "lon": 72.57},
    {"id": "jaipur", "name": "Jaipur, Rajasthan", "lat": 26.91, "lon": 75.78},
    {"id": "lucknow", "name": "Lucknow, Uttar Pradesh", "lat": 26.84, "lon": 80.94},
    {"id": "chandigarh", "name": "Chandigarh", "lat": 30.73, "lon": 76.77},
    {"id": "patna", "name": "Patna, Bihar", "lat": 25.59, "lon": 85.13},
    {"id": "london", "name": "London, United Kingdom", "lat": 51.50, "lon": -0.12},
    {"id": "new-york", "name": "New York, USA", "lat": 40.71, "lon": -74.00},
    {"id": "dubai", "name": "Dubai, UAE", "lat": 25.20, "lon": 55.27},
    {"id": "singapore", "name": "Singapore", "lat": 1.35, "lon": 103.81},
]


@app.get("/api/zones/search", tags=["Locations"])
def search_zones(q: str = ""):
    """Search zones and cities worldwide using Open-Meteo Geocoding API + popular presets."""
    query = (q or "").strip()
    if not query:
        return {"results": POPULAR_CITIES[:8]}

    # 1. Match local preset cities
    q_lower = query.lower()
    local_matches: List[Dict[str, Any]] = [
        c for c in POPULAR_CITIES
        if q_lower in str(c["name"]).lower() or q_lower in str(c["id"])
    ]

    # 2. Query Open-Meteo worldwide geocoding API
    geo_results: List[Dict[str, Any]] = []
    try:
        resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": query, "count": 6, "language": "en", "format": "json"},
            timeout=4,
        )
        if resp.ok:
            data = resp.json()
            for item in data.get("results", []):
                country = item.get("country", "")
                admin1 = item.get("admin1", "")
                city_name = item.get("name", "")
                parts = [p for p in [city_name, admin1, country] if p]
                full_name = ", ".join(parts)
                geo_results.append({
                    "id": f"geo-{item.get('id')}",
                    "name": full_name,
                    "lat": item.get("latitude"),
                    "lon": item.get("longitude"),
                })
    except Exception as exc:
        logger.warning("Geocoding API search error: %s", exc)

    # Combine unique results
    seen_names: Set[str] = set()
    combined: List[Dict[str, Any]] = []
    for item in local_matches + geo_results:
        key = str(item["name"]).lower()
        if key not in seen_names:
            seen_names.add(key)
            combined.append(item)

    return {"results": combined[:10]}


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
            "focus": request.focus,
            "household": request.household,
            "routine": request.routine,
            "travel": request.travel,
            "cooking": request.cooking,
            "outdoor_time": request.outdoor_time,
        }
        # Filter out None values
        answers = {k: v for k, v in answers.items() if v is not None}
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


@app.post("/api/explore-more", response_model=ExploreMoreResponse, tags=["Explore"])
def explore_more(request: ExploreMoreRequest):
    """Generate fresh, practical clean-air solutions.

    Serves ideas exclusively from the curated clean‑air idea library.
    """
    category = request.category or "all"
    existing_titles_set = set(t.lower() for t in (request.existingTitles or []))

    # 1. Attempt Gemini Generation if API key is configured
    # Gemini integration disabled – always serve ideas from the curated library.
    # Previously the endpoint attempted to call Gemini when a valid GEMINI_API_KEY was present.
    # This block has been removed to simplify the system and rely exclusively on the static idea library.


    # 2. Curated Idea Library Fallback (Instant, Offline & Zero-cost)
    import random

    def build_card_payload(c: Dict[str, Any]) -> ExploreMoreCard:
        return ExploreMoreCard(
            id=c.get("id", f"curated-{random.randint(1000, 9999)}"),
            category=c.get("category", "sustainable"),
            title=c.get("title", "Clean Air Habit"),
            summary=c.get("summary", ""),
            detail=c.get("detail", c.get("summary", "")),
            impactLevel=c.get("impactLevel", "High"),
            impact=c.get("impact", "high"),
            tag=c.get("tag", c.get("kicker", "Clean Choice")),
            kicker=c.get("kicker", c.get("tag", "Clean Choice")),
            benefit=c.get("benefit", c.get("detail", "Reduces fine particulate exposure")),
            steps=c.get("steps") or [c.get("detail", c.get("summary", ""))],
            swapFrom=c.get("swapFrom", ""),
            swapTo=c.get("swapTo", ""),
            timeToSeeImpact=c.get("timeToSeeImpact", "Immediate"),
            effort=c.get("effort", "low"),
            difficulty=c.get("difficulty", "Easy"),
            cost=c.get("cost", "Free"),
            costTier=c.get("costTier", "free"),
        )

    categories_to_fetch = ["sustainable", "routines", "indoor"] if category == "all" else [category]
    per_cat_target = 3 if category == "all" else 4
    selected_cards = []

    for cat in categories_to_fetch:
        cat_pool = [c for c in CURATED_EXPLORE_IDEAS if c.get("category") == cat]
        unseen = [c for c in cat_pool if c["title"].lower() not in existing_titles_set]
        
        # Shuffle unseen candidates
        random.shuffle(unseen)
        chosen = unseen[:per_cat_target]
        
        # If we need more to reach target, sample from the remainder of the pool
        if len(chosen) < per_cat_target and cat_pool:
            remaining_needed = per_cat_target - len(chosen)
            chosen_titles = {c["title"].lower() for c in chosen}
            other_candidates = [c for c in cat_pool if c["title"].lower() not in chosen_titles]
            random.shuffle(other_candidates)
            chosen.extend(other_candidates[:remaining_needed])
            
        selected_cards.extend(chosen)

    # In the rare event nothing matched, return first available
    if not selected_cards:
        selected_cards = CURATED_EXPLORE_IDEAS[:4]

    return ExploreMoreResponse(cards=[build_card_payload(c) for c in selected_cards])


# ---------------------------------------------------------------------------
# Ask Ventura Assistant (Groq REST API + Guaranteed Offline Curated Fallback)
# ---------------------------------------------------------------------------

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-20b"


def _load_groq_api_key() -> str:
    """Read GROQ_API_KEY from environment or project .env without extra dependencies."""
    env_val = os.getenv("GROQ_API_KEY", "").strip()
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
                if key.strip() == "GROQ_API_KEY":
                    return val.strip().strip('"').strip("'")
    except Exception as exc:
        logger.warning("Could not read .env for GROQ_API_KEY: %s", exc)
    return ""


def _to_assistant_card(item: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a curated idea dict into the SustainableAssistantCard shape."""
    raw_impact = str(item.get("impact") or item.get("impactLevel") or "medium").lower()
    impact = "high" if "high" in raw_impact else "low" if "low" in raw_impact else "medium"
    return {
        "title": str(item.get("title", "Clean Air Alternative")),
        "explanation": str(item.get("summary") or item.get("detail") or ""),
        "benefit": str(item.get("benefit") or item.get("detail") or "Reduces daily exposure and emissions."),
        "impact": impact,
        "category": str(item.get("tag") or item.get("kicker") or "Sustainable Choice"),
    }


def _build_offline_ask_response(
    message: str,
    air_quality: Optional[Dict[str, Any]],
    profile: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """Build a deterministic, helpful sustainable-alternatives response from curated data."""
    msg_lower = message.lower()

    off_topic_markers = (
        "write code", "python script", "javascript", "solve equation",
        "cricket score", "movie review", "stock price", "recipe for cake",
    )
    if any(marker in msg_lower for marker in off_topic_markers):
        return {
            "reply": (
                "I focus exclusively on sustainable clean-air alternatives—like low-emission commutes, "
                "cleaner cooking, well-sealed masks, and indoor air improvements. Ask me about any of those!"
            ),
            "cards": [],
        }

    topic_keywords = {
        "commute": ("commute", "travel", "metro", "bus", "car", "bike", "ebike", "e-bike", "traffic", "drive", "scooter"),
        "cooking": ("cook", "kitchen", "stove", "lpg", "gas", "induction", "fry", "smoke"),
        "mask": ("mask", "n95", "ffp2", "respirator", "seal", "outdoor", "walk", "run"),
        "indoor": ("indoor", "home", "room", "window", "purifier", "hepa", "plant", "dust", "air out", "ventilat"),
        "heating": ("heat", "heater", "warm", "wood", "incense", "burn", "coal"),
    }

    matched_terms: List[str] = []
    for terms in topic_keywords.values():
        if any(t in msg_lower for t in terms):
            matched_terms.extend(terms)

    scored: List[tuple[int, Dict[str, Any]]] = []
    for idea in CURATED_EXPLORE_IDEAS:
        searchable = " ".join([
            str(idea.get("title", "")),
            str(idea.get("summary", "")),
            str(idea.get("detail", "")),
            str(idea.get("tag", "")),
            str(idea.get("kicker", "")),
        ]).lower()
        score = 0
        for word in msg_lower.split():
            clean_word = word.strip(".,?!'\"")
            if len(clean_word) >= 3 and clean_word in searchable:
                score += 3
        for term in matched_terms:
            if term in searchable:
                score += 2
        if idea.get("category") == "sustainable":
            score += 1
        if str(idea.get("impact", "")).lower() == "high":
            score += 1
        scored.append((score, idea))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    top_cards = [_to_assistant_card(item) for _, item in scored[:3]]

    aqi_val = air_quality.get("aqi") if isinstance(air_quality, dict) else None
    pollutant = (air_quality.get("mainPollutant") or "PM2.5") if isinstance(air_quality, dict) else "PM2.5"
    zone_name = (air_quality.get("zoneName") or "your area") if isinstance(air_quality, dict) else "your area"
    household = (profile.get("household") or "") if isinstance(profile, dict) else ""

    context_prefix = (
        f"With AQI around {aqi_val} ({pollutant} dominant) in {zone_name}, "
        if aqi_val is not None
        else ""
    )
    household_note = f" Keeping {household.lower()} in mind," if household else ""

    reply = (
        f"{context_prefix}here are practical sustainable alternatives you can put into action today."
        f"{household_note} Tap any card below for details or add it directly to your plan."
    )
    return {"reply": reply, "cards": top_cards}


def _call_groq_ask_ventura(request: AskVenturaRequest) -> Dict[str, Any]:
    """Call Groq chat completions via plain requests; fall back cleanly on any error."""
    api_key = _load_groq_api_key()
    if not api_key:
        return _build_offline_ask_response(request.message, request.airQuality, request.profile)

    try:
        aq = request.airQuality or {}
        prof = request.profile or {}
        system_prompt = (
            "You are Ask Ventura, a concise clean-air and sustainable living assistant. "
            "Focus strictly on sustainable alternatives, low-emission commutes, clean cooking, "
            "indoor air improvements, and protective masks. If asked something completely off-topic, "
            "politely redirect to sustainable clean-air topics with an empty cards array. "
            f"Current air context: zone={aq.get('zoneName', 'Delhi')}, AQI={aq.get('aqi', 'unknown')}, "
            f"mainPollutant={aq.get('mainPollutant', 'PM2.5')}. "
            f"User profile: priority={prof.get('priority', '')}, household={prof.get('household', '')}, "
            f"routine={prof.get('routine', '')}. "
            "Respond ONLY with valid JSON matching: "
            '{"reply": "2-3 concise practical sentences", '
            '"cards": [{"title": "...", "explanation": "...", "benefit": "...", '
            '"impact": "high"|"medium"|"low", "category": "..."}]} (2 to 3 cards).'
        )

        messages_payload: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for item in (request.history or [])[-6:]:
            role = "assistant" if item.get("role") == "assistant" else "user"
            text = str(item.get("text") or "").strip()
            if text:
                messages_payload.append({"role": role, "content": text})
        if not messages_payload or messages_payload[-1]["content"] != request.message.strip():
            messages_payload.append({"role": "user", "content": request.message.strip()})

        resp = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages_payload,
                "temperature": 0.4,
                "max_tokens": 500,
                "response_format": {"type": "json_object"},
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        raw_content = data["choices"][0]["message"]["content"]
        parsed = json.loads(raw_content)

        reply_text = str(parsed.get("reply") or "").strip()
        raw_cards = parsed.get("cards") if isinstance(parsed.get("cards"), list) else []
        valid_cards: List[Dict[str, Any]] = []
        for c in raw_cards[:3]:
            if not isinstance(c, dict) or not c.get("title"):
                continue
            raw_imp = str(c.get("impact") or "medium").lower()
            imp = "high" if "high" in raw_imp else "low" if "low" in raw_imp else "medium"
            valid_cards.append({
                "title": str(c["title"]),
                "explanation": str(c.get("explanation") or ""),
                "benefit": str(c.get("benefit") or ""),
                "impact": imp,
                "category": str(c.get("category") or "Sustainable Choice"),
            })

        if reply_text:
            return {"reply": reply_text, "cards": valid_cards}
    except Exception as exc:
        logger.warning("Groq ask-ventura failed, using offline fallback: %s", exc)

    return _build_offline_ask_response(request.message, request.airQuality, request.profile)


@app.post("/api/ask-ventura", tags=["Ask Ventura"])
def ask_ventura(request: AskVenturaRequest):
    """Stream Ask Ventura assistant response over SSE (Groq with offline fallback)."""
    result = _call_groq_ask_ventura(request)

    def event_stream():
        payload = {
            "type": "done",
            "reply": result["reply"],
            "cards": result["cards"],
        }
        yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
