# Ventura: Design PRD

## 1. Design goal
Make Ventura look polished, calm, and easy to scan on both mobile phones and desktop browsers. It uses a warm, earthy palette with rounded cards, clear typography, and a prominent sustainable alternatives section.

## 2. Style direction
- **Overall feel:** modern mobile-first web app with soft cream cards, subtle borders/shadows, and generous spacing.
- **Type and writing:** bold, uppercase navigation/badge labels paired with clean sans-serif body text and short, actionable sentences.
- **Brand identity:** Ventura leaf logo (`VenturaLogo.tsx` and browser favicon `frontend/public/favicon.svg`) with `#3D6048` theme color. Tagline: *"Cleaner air starts with you"* (city-agnostic; replaces the former Delhi-specific tagline).

## 3. Colors (earthy palette)
- **Background:** warm sand/cream (`#F6F0E5`).
- **Surface / Cards:** soft off-white (`#FBF8F1`) with subtle charcoal borders (`#343A32/10`).
- **Main text:** deep charcoal/forest (`#343A32`).
- **Primary accent:** forest green (`#3D6048`).
- **Secondary accent:** terracotta/clay (`#B5633E` / `#D98C68`) and warm gold (`#E8C879` on dark surfaces).
- **Air-quality status colors:** used only on status indicators alongside explicit text labels (`Good`, `Moderate`, `Poor`, `Very Poor`, `Hazardous`).

## 4. Typography
- **Headlines & UI:** `Plus Jakarta Sans` and `DM Sans` (loaded via Google Fonts in `frontend/index.html`).
- **Labels and badges:** bold, uppercase, compact (`10px–11px`), paired with `whitespace-nowrap`.
- **Body:** clean, readable sans-serif with short summaries and scannable step lists.

## 5. Layout & Navigation
- **Splash Screen (`SplashScreen.tsx`):** shown on first app load. Full-screen cream background (`#F6F0E5`), centred oversized Ventura leaf logo (80×80 px rounded square), wordmark, and tagline *"Cleaner air starts with you"*. Three pulsing dots at the bottom. Animates in with a spring motion (`motion/react`), holds for 2.2 s, then fades out in 0.6 s. Respects `prefers-reduced-motion`.
- **Fixed Bottom Navigation (`BottomNav.tsx`):** 4 tabs (`HOME`, `MY PLAN` with saved-item badge, `EXPLORE`, `ASK VENTURA`).
- **Home Screen (`HomeScreen.tsx`):**
  1. **Header & Location Bar:** Ventura leaf logo, dynamic time-of-day + city greeting (e.g., `Good morning, Delhi`), and city selector with worldwide search + GPS ("Use my current location").
  2. **Hero Air Status Card:** current AQI number, status label, summary, and quick share/refresh actions.
  3. **Pollutant Breakdown:** PM2.5, NO2, and dominant pollutant cards (tappable for detail sheets).
  4. **Four Area Highlights & Quick Start:** links to personalize plan or jump to Explore/My Plan.
- **My Plan Screen (`MyPlanScreen.tsx`):** personalized recommendations across the four areas, with sustainable alternatives highlighted, "Not for me" dismissal, and completion/check-in toggles.
- **Explore Screen (`ExploreScreen.tsx`):**
  - Category filter pills (`All guides`, `Sustainable`, `Routines`, `Indoor air`).
  - Search input and impact-level sort toggle.
  - **"Get fresh ideas for today's air"** button that loads new unseen cards from the curated library.
  - Priority category banner cards and tappable detail sheets (`DetailSheet.tsx`).
- **Ask Ventura Screen (`AskVenturaScreen.tsx`):** chat interface with starter questions, message list, and "Add to plan" card actions. Powered by Groq AI with graceful offline fallback to curated cards if the API is unavailable.

## 6. Impact Badges (`ImpactBadge.tsx`)
- Every card displays a crisp **3-bar cellular signal icon** paired with a text label:
  - **High impact:** 3 active bars (forest green `#3D6048`, or warm gold `#E8C879` on dark cards).
  - **Medium impact:** 2 active bars (terracotta `#B5633E`).
  - **Low impact:** 1 active bar (muted sage `#5A6356`).
- Impact parsing is case-insensitive (`High`/`high`, `Medium`/`medium`, `Low`/`low`).

## 7. Mobile, Desktop & Accessibility
- Mobile-first single-column layout (`max-w-3xl` container) that scales cleanly to laptop/desktop viewports.
- Minimum `44px–48px` touch targets on navigation and action buttons.
- Text contrast >= 4.5:1; every status/impact color is paired with text and/or iconography.
- Keyboard focus outlines (`focus-visible:outline-2`) and `aria-current` / `aria-label` attributes throughout.
