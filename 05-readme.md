# Ventura

Ventura helps people in Delhi cope with winter smog. It checks the current air quality and gives each person simple, personal steps to breathe cleaner air and reduce their own pollution.

## What it does
- Shows Delhi's current air level in plain words.
- Gives daily routines, indoor air hacks, and sustainable alternatives for each user.
- Shows the impact of each action as high, medium, or low.
- Includes a small chat that answers questions about sustainable alternatives.

## Data sources
- **Open-Meteo air quality API:** free, no key needed. Delhi coordinates: 28.61 latitude, 77.21 longitude.
- **WAQI (aqicn.org):** backup source, needs a free token.
- A sample reading is included for demo mode.

## Setup
1. Clone the repository.
2. Create a virtual environment and install the packages in `requirements.txt`.
3. Copy `.env.example` to `.env` and add your AI model key. Never commit `.env`.
4. Run the app with the command in the Technical PRD.

## Running tests
Run the test suite before each upload. Results are summarized below.
- Data parsing: pending
- Rules and advice mapping: pending
- Cache timing: pending
- Chat limits: pending
- App starts: pending

## Security notes
- Keys are stored in the host's secrets settings.
- No personal data is stored beyond the session.
- Chat history is cleared when the user leaves the page.

## Accessibility notes
- Text meets a 4.5 to 1 contrast ratio.
- Every color has a text label.
- Controls work with the keyboard.

## Document index
- `01-master-prd.md`: overall product, scope, and submission details.
- `02-technical-prd.md`: architecture, data, security, and quality rules.
- `03-design-prd.md`: colors, type, layout, and visual rules.
- `04-flow-prd.md`: screens and user journeys.
- `05-readme.md`: this file.

## Status
In planning. Built in Antigravity for PromptWars Virtual (submission window closes November 29, 2026).
