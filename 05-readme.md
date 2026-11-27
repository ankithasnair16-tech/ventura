# Ventura

Ventura is a clean-air web app for anyone living with air pollution — not just Delhi. It checks live air quality for any city worldwide (via search, GPS, or Delhi neighbourhood presets) and gives each user simple, personal steps to breathe cleaner air. **Tagline: "Cleaner air starts with you."**

## What it does
- **Splash screen** on first load — logo + tagline, fades out in ~2 seconds.
- Shows current AQI, PM2.5, NO2, and dominant pollutant in plain language.
- Supports Delhi neighbourhood presets (each with real lat/lon for distinct AQI readings), worldwide city search, and browser GPS location.
- Builds a personalized 4-area plan (`Sustainable alternatives`, `Daily routines`, `Indoor air hacks`, `Impact of actions`) from a 3-step tapped assessment.
- Displays a 3-bar signal icon and text impact level (`High`, `Medium`, `Low impact`) on every recommendation.
- Provides an **Explore** library with category filters, search, impact sorting, and fresh-ideas rotation from a curated offline library.
- **Ask Ventura** chat tab powered by **Groq AI** (`openai/gpt-oss-20b`) with an air-quality-aware system prompt; falls back to curated card responses if Groq is unavailable.
- Includes **"Not for me"** dismissal, plan saving, and local browser persistence (`localStorage`).

## Data sources
- **Primary Air Quality:** WAQI API — real monitoring station data via `geo:{lat};{lon}`. Requires `WAQI_TOKEN` env var.
- **Fallback Air Quality:** Open-Meteo Air Quality API (free, keyless). Used when WAQI is unavailable.
- **City Search:** Open-Meteo Geocoding API combined with built-in `POPULAR_CITIES` presets.
- **Ask Ventura AI:** Groq REST API (`openai/gpt-oss-20b`). Requires `GROQ_API_KEY` env var.
- **Offline fallback:** 30-minute in-memory cache → last cached reading → built-in sample reading.

## Setup
1. Clone the repository and create a Python virtual environment.
2. Install backend dependencies: `pip install -r requirements.txt`
3. Create `.env` in the project root with your keys:
   ```
   WAQI_TOKEN=your_waqi_token_here
   GROQ_API_KEY=your_groq_key_here
   ```
4. Install frontend dependencies: `cd frontend && npm install`
5. Start the FastAPI backend: `uvicorn api.main:app --host 127.0.0.1 --port 8001 --reload`
6. Start the Vite frontend: `cd frontend && npm run dev` and open `http://localhost:5173`.

> The app works without API keys — WAQI falls back to Open-Meteo, and Ask Ventura falls back to curated offline cards.

## Running tests
Run the automated Python test suite from the project root:
```bash
python -m pytest -v
```
**30 tests, all passing.** Tests cover:
- `tests/test_air_data.py`: AQI categories, dominant pollutant calculation, WAQI + Open-Meteo payload parsing, sample reading.
- `tests/test_cache.py`: 30-minute TTL caching and offline/sample fallbacks.
- `tests/test_rules.py`: rules table, plain language, PM2.5/NO2 routing, 4-area ordering, dismissals.
- `tests/test_api.py`: FastAPI endpoints (`/api/health`, `/api/air-quality`, `/api/plan`, `/api/ask-ventura`, CORS, validation).
- `tests/test_app_smoke.py`: legacy Streamlit headless startup.
- `tests/test_ui_contrast_and_layout.py`: WCAG contrast ratio (>= 4.5:1) and layout specs.

## Security & Privacy notes
- API keys are stored in `.env` only — never committed to git (`.gitignore` excludes `.env` and `node_modules/`).
- Groq key is read server-side only; never sent to the browser.
- User profile, selected city, saved/dismissed items, and check-ins are stored locally in the browser (`localStorage`), with no server-side user database.
- Unhandled backend errors are caught globally without exposing stack traces.

## Document index
- `01-master-prd.md`: overall product, scope, and submission details.
- `02-technical-prd.md`: architecture, API endpoints, data handling, and testing.
- `03-design-prd.md`: colors, typography, layout, and visual rules.
- `04-flow-prd.md`: screens, user journeys, and error fallbacks.
- `05-readme.md`: this overview.

## Status
Fully implemented and active — FastAPI backend + React/Vite frontend, WAQI primary AQI, Groq AI Ask Ventura, splash screen, per-neighbourhood Delhi AQI, 30/30 tests passing.
