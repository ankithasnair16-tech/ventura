# Ventura: Master PRD

## 1. Summary
Ventura is a web app that helps people cope with air pollution — not just in Delhi, but anywhere. It checks live air quality for any city worldwide (via search, device GPS, or Delhi neighbourhood presets) and gives each user simple, personal steps to breathe cleaner air and reduce their own pollution. The tagline is **"Cleaner air starts with you."**

## 2. Problem
Severe smog and poor air quality are hard to live with. People know the air is bad, but they don't know what to do about it in their own daily life. Generic tips give the same advice to everyone, with no link to the air on that day or to how the person lives.

## 3. Goal
Give each user a short, personal plan based on live air data, and show clearly what each action changes—without requiring accounts, logins, or paid AI API keys.

## 4. Target users
- Families, especially parents with young children and elderly members.
- People with breathing conditions, such as asthma.
- Commuters and anyone who spends time outdoors in any polluted city — Delhi, Lucknow, Mumbai, or beyond.

## 5. Scope: the four required areas
1. **Sustainable alternatives:** options that fit the user's lifestyle and routine. This is the most highlighted part of the app.
2. **Low-emission daily routines:** simple habits for the day, such as when to travel and how to cook.
3. **Indoor air quality hacks:** easy steps to keep air cleaner at home.
4. **Direct impact of actions:** each suggestion says what it changes, in simple levels (`High`, `Medium`, `Low`).

## 6. Core features
- **Splash screen:** full-screen branded intro on first load — Ventura logo, tagline *"Cleaner air starts with you"* — auto-dismisses after ~2 seconds with a smooth fade transition.
- **Quick start onboarding:** a 3-step tapped assessment covering core priority/focus, household context, and typical daily routine (see the Flow PRD).
- **Live air reading (global):** defaults to Delhi and supports worldwide city search (via Open-Meteo Geocoding + popular city presets) and "Use my current location" browser GPS. Displays AQI, PM2.5, NO2, plain-language category, and dominant pollutant.
- **Per-neighbourhood AQI:** Delhi dropdown zones each have precise lat/lon coordinates (Lodhi Road, Hauz Khas, Anand Vihar, Dwarka, Rohini, etc.) so each returns a genuinely different reading from its own WAQI monitoring station.
- **Pollutant-matched advice:** if fine dust (PM2.5) is the main problem, advice focuses on masks and purifiers; if NO2 is high, advice focuses on traffic and cooking sources.
- **Impact levels:** each tip shows a 3-bar signal icon and qualitative level (`High impact`, `Medium impact`, `Low impact`) as general guidance, not medical advice.
- **Explore & curated ideas rotation:** category-filtered guide library (`Sustainable`, `Routines`, `Indoor air`) with search, impact sorting, and a **"Get fresh ideas for today's air"** button that rotates unseen ideas from the curated offline library (`data/curated_ideas.py`) without external AI calls.
- **My Plan & "Not for me" control:** users can save ideas to their plan, track completion/daily check-ins locally, or dismiss any suggestion with "Not for me."
- **Ask Ventura (Groq AI chat):** a dedicated chat tab powered by **Groq API** (`openai/gpt-oss-20b` model) with an air-quality-aware system prompt. Falls back gracefully to curated offline card responses if Groq is unavailable — the app never crashes or shows a blank screen.

## 7. Out of scope
- External LLM/Gemini API integration (removed; Explore relies on the curated library).
- User accounts, authentication, and remote cloud storage (preferences and plan progress are stored locally in the browser's `localStorage`).
- Sourced medical or clinical research citations for impact figures.

## 8. Data sources
- **Primary Air Quality:** WAQI (World Air Quality Index) API — real monitoring station data, accessed via the `geo:{lat};{lon}` endpoint. Requires `WAQI_TOKEN` env var.
- **Secondary Air Quality (fallback):** Open-Meteo Air Quality API (free, no key). Used when WAQI is unavailable.
- **City Search:** Open-Meteo Geocoding API combined with a built-in `POPULAR_CITIES` preset list.
- **Ask Ventura AI:** Groq REST API (`openai/gpt-oss-20b`). Requires `GROQ_API_KEY` env var. Falls back to curated library responses offline.
- **Fallback:** 30-minute in-memory cache → last cached reading → built-in sample reading clearly labeled as sample data.

## 9. Success criteria
- All four required areas are visible and personalized.
- Every tip shows its 3-bar signal icon and text impact level.
- The app works cleanly on both mobile and desktop screens.
- Live air quality, city search, and Explore fresh-ideas rotation work without external API keys.
- Ask Ventura returns AI responses via Groq with graceful offline fallback.
- Different Delhi neighbourhoods show different AQI readings.

## 10. Submission & evaluation context (PromptWars Virtual)
- Public GitHub repo, under 10 MB, with public access.
- Evaluated on code quality, security, efficiency, testing, accessibility, and problem statement alignment.
- Window: November 16, 2026 – November 29, 2026.
