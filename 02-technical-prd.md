# Ventura: Technical PRD

## 1. Overview
Ventura is a full-stack web application consisting of a **FastAPI** Python backend and a **React + TypeScript + Vite** frontend (with the legacy Streamlit entry point `app.py` also preserved in the repository). It fetches live air-quality data from WAQI (primary) and Open-Meteo (fallback), applies deterministic rules for personalized clean-air plans, serves curated ideas from an offline library, and answers air-quality questions via the Groq AI API with an offline fallback.

## 2. Current Stack
- **Backend:** Python 3.14, FastAPI, Uvicorn, Pydantic, Requests.
- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, `motion/react` (animations), Lucide React icons.
- **Legacy UI (preserved):** Streamlit (`app.py`, `ui/`).
- **AI / LLM:** Groq REST API (`openai/gpt-oss-20b` model) for Ask Ventura chat. Gemini integration was removed. `POST /api/explore-more` serves exclusively from `data/curated_ideas.py`.
- **Environment variables:** `WAQI_TOKEN` (required for primary AQI), `GROQ_API_KEY` (required for live Ask Ventura). Both loaded from `.env` via stdlib `pathlib` — no extra packages.

## 3. Architecture & Components
1. **Data module (`data/air_quality.py`):** WAQI geo endpoint (`/feed/geo:{lat};{lon}`) as primary AQI source; Open-Meteo Air Quality API as fallback. Accepts any `lat`/`lon` for worldwide coverage. Returns AQI, PM2.5, NO2, dominant pollutant, category, and WCAG status color.
2. **Cache:** 30-minute in-memory TTL cache in `AirQualityService`. Custom-coordinate requests (non-default Delhi) bypass the cache to always return a fresh per-location reading. Fallback chain: live → last cached → built-in sample.
3. **Curated Ideas Library (`data/curated_ideas.py`):** stores `CURATED_EXPLORE_IDEAS` across `sustainable`, `routines`, and `indoor` categories. Used by both Explore and Ask Ventura offline fallback.
4. **Rules module (`rules/advice_rules.py`):** maps dominant pollutant (`PM2.5` or `NO2`) and onboarding answers (`priority`, `household`, `routine`) to categorized `AdviceItem` recommendations and impact levels (`High`, `Medium`, `Low`).
5. **FastAPI REST API (`api/main.py`):**
   - `GET /health` & `GET /api/health` – health checks.
   - `GET /api/air-quality` – returns live/cached/sample air quality for any `lat`/`lon`; WAQI primary, Open-Meteo fallback.
   - `GET /api/zones/search` – searches `POPULAR_CITIES` presets and Open-Meteo Geocoding API for worldwide cities with `lat`/`lon`.
   - `POST /api/plan` – generates personalized 4-area recommendations via `get_personalized_plan` with `dismissed_ids` support.
   - `POST /api/explore-more` – randomly selects unseen cards from `CURATED_EXPLORE_IDEAS` by category.
   - `POST /api/ask-ventura` – air-quality-aware chat using Groq REST API (`openai/gpt-oss-20b`); falls back to `_build_offline_ask_response()` using curated library + live AQI context. Returns `text/event-stream` SSE with `data: {"type": "done", "reply": "...", "cards": [...]}`.
6. **Frontend (`frontend/src/`):**
   - `SplashScreen.tsx` — full-screen branded intro with `motion/react` fade animation; auto-dismisses after 2.2 s.
   - `App.tsx` — root component, manages `showSplash` state, renders splash then main app.
   - `HomeScreen.tsx`, `OnboardingFlow.tsx`, `MyPlanScreen.tsx`, `ExploreScreen.tsx`, `AskVenturaScreen.tsx`, `BottomNav.tsx`, `ImpactBadge.tsx`, `DetailSheet.tsx`, `VenturaLogo.tsx`.
   - `VenturaLogo.tsx` — leaf icon + "Ventura" wordmark; `showTagline` prop displays *"Cleaner air starts with you"* (city-agnostic tagline replacing the former Delhi-specific one).
   - Vite dev server proxies `/api/*` requests to the FastAPI backend (`http://127.0.0.1:8001`).
7. **Zone coordinates (`frontend/src/data/venturaContent.ts`):** all 9 Delhi dropdown zones now carry precise `lat`/`lon` (e.g. Anand Vihar `28.6469, 77.3153`; Hauz Khas `28.5494, 77.2001`) so each hits its own WAQI monitoring station for a genuinely distinct AQI reading. Searched cities receive coordinates directly from the geocoding API.

## 4. Data Handling & Persistence
- Air quality readings are cached for 30 minutes (`TTL`) for the default Delhi coordinate only. Per-zone/per-city coordinate requests always fetch fresh data.
- If WAQI fails → Open-Meteo. If both fail → last cached reading → demo sample data (`is_sample: true`).
- User onboarding profile, selected city/zone, saved plan items, dismissed IDs, completed IDs, and daily check-ins are stored client-side in `localStorage` (`ventura_delhi_state_v2`). No server-side database or user accounts exist.

## 5. Security & Privacy
- **API keys stored in `.env` only** — never hardcoded. `WAQI_TOKEN` and `GROQ_API_KEY` loaded via stdlib `pathlib`; `.gitignore` excludes `.env` and `node_modules/`.
- Groq key is read server-side only; never exposed to the browser.
- Input validation via Pydantic schemas (`PlanRequest`, `ExploreMoreRequest`, `AskVenturaRequest`).
- Global FastAPI exception handler suppresses internal stack traces and returns friendly JSON error messages.
- CORS configured for local React/Vite development origins (`localhost:5173`, `127.0.0.1:5173`, `localhost:3000`, `127.0.0.1:3000`).

## 6. Testing
Automated test suite in `tests/` using `pytest` — **30 tests, all passing**:
- `tests/test_air_data.py` – AQI categories, dominant pollutant calculation, WAQI + Open-Meteo payload parsing, sample reading format.
- `tests/test_cache.py` – 30-minute TTL caching and offline/sample fallbacks.
- `tests/test_rules.py` – rules table structure, plain language checks, PM2.5 vs. NO2 routing, 4-area ordering, "Not for me" dismissal, onboarding answer influence.
- `tests/test_api.py` – FastAPI `/api/health`, `/api/air-quality`, `/api/plan`, `/api/ask-ventura` (offline fallback + Groq error fallback), validation errors, and CORS headers.
- `tests/test_app_smoke.py` – legacy Streamlit headless smoke test.
- `tests/test_ui_contrast_and_layout.py` – WCAG contrast ratio (>= 4.5:1) and CSS/button specs.

## 7. Accessibility
- Text contrast >= 4.5:1 across light and dark surfaces.
- Color indicators (status badges and impact levels) always include explicit text labels and 3-bar signal icons.
- Semantic HTML buttons, `aria-current`, `aria-label`, and keyboard focus outlines.
- `prefers-reduced-motion` media query in `index.css` disables all animations for users who opt out.
