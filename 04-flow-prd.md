# Ventura: Flow PRD

## 1. Main user journey
1. The user opens the Ventura web app (`http://localhost:5173`).
2. The **Splash Screen** appears for ~2 seconds — Ventura logo, tagline *"Cleaner air starts with you"* — then fades out automatically.
3. The **Home** screen greets the user for their selected city (defaults to Delhi) and shows live AQI, PM2.5, NO2, and dominant pollutant.
4. The user can switch locations anytime by searching any city worldwide or tapping **Use my current location** (browser GPS). Delhi neighbourhood presets each have their own coordinates and return genuinely distinct AQI readings.
5. The user taps **Personalize my plan** to complete the 3-step **Onboarding** flow.
6. **My Plan** displays personalized recommendations across the four areas, where users can mark items done, log daily check-ins, or dismiss tips with **Not for me**.
7. On **Explore**, users browse guides by category (`Sustainable`, `Routines`, `Indoor air`), search, sort by impact, inspect details in a bottom/modal sheet, add guides to their plan, or tap **Get fresh ideas for today's air** to rotate unseen ideas from the curated library.

## 2. Screens

### Screen 1: Home (`HomeScreen.tsx`)
- Ventura leaf logo and dynamic greeting (`Good morning/afternoon/evening, <City>`).
- Location selector modal/drawer with popular city presets, worldwide Open-Meteo city search (`/api/zones/search`), and GPS button (`navigator.geolocation`).
- Hero AQI card + PM2.5 / NO2 / main pollutant cards (each opens a `DetailSheet` with plain-language context).
- Quick access to start/update the 3-step onboarding or navigate to My Plan / Explore.

### Screen 2: Onboarding / Quick Start (`OnboardingFlow.tsx`)
3 tapped multiple-choice steps (no free text required):
1. **Priority / Focus:** e.g., Protecting my family, Staying safer when I'm outdoors, Keeping the air at home cleaner, Making healthier everyday choices.
2. **Household:** e.g., Just me, Children, Older adults, Someone with breathing sensitivities, My whole household.
3. **Daily Routine:** e.g., Mostly indoors, Commuting around the city, Spending lots of time outdoors, A mix of everything.

### Screen 3: My Plan (`MyPlanScreen.tsx`)
- Displays personalized recommendations grouped by area (Sustainable alternatives highlighted first, followed by Daily routines, Indoor air hacks, and Impact of actions).
- Each card shows its title/tip, 3-bar signal icon + impact label (`High`/`Medium`/`Low impact`), and controls to mark complete or dismiss (**Not for me**).
- Plan progress, saved custom cards, and daily check-ins persist in `localStorage`.

### Screen 4: Explore (`ExploreScreen.tsx`)
- Filter pills: `All guides`, `Sustainable`, `Routines`, `Indoor air`.
- Search bar and **Sort by impact** toggle.
- **"Get fresh ideas for today's air"** button calls `POST /api/explore-more` with `category` and `existingTitles`, returning fresh unseen cards from `CURATED_EXPLORE_IDEAS`.
- Tapping any card opens `DetailSheet.tsx` with full steps, swap from/to comparison, cost/effort tags, and **Add to plan**.

### Screen 5: Ask Ventura (`AskVenturaScreen.tsx`)
- Accessible from the bottom navigation bar (`ASK VENTURA`).
- Shows starter question chips and a chat input.
- Submitting a message calls `POST /api/ask-ventura` which uses the **Groq API** (`openai/gpt-oss-20b`) with an air-quality-aware system prompt.
- If Groq is unavailable or the API key is missing, the backend falls back to `_build_offline_ask_response()` using the curated library + live AQI context — returning valid cards without crashing.
- Frontend parses the SSE stream (`text/event-stream`); cards appear as tappable "Add to plan" actions in the chat.

## 3. Error and fallback flow
- **Live air data fails:** backend tries WAQI → Open-Meteo → last cached reading (30-min TTL) → built-in sample baseline (`is_sample: true`), so the UI remains usable at all times.
- **Geolocation denied/unavailable:** shows a clear alert and keeps the currently selected city.
- **Explore endpoint unavailable:** shows a friendly inline notice while keeping existing curated cards visible.
- **Ask Ventura Groq unavailable:** backend silently falls back to curated offline cards; user sees a helpful response with no error message.

## 4. Accessibility in the flow
- All tabs, onboarding options, search inputs, and detail sheets are keyboard-navigable.
- Impact levels use both color, a 3-bar signal icon, and explicit text labels.
- Error states are concise and never expose stack traces or internal details.
