# Ventura 🌿

> **BREATHE BETTER. LIVE CLEANER.**  
> A lightweight, privacy-first web application providing personalized winter smog adaptation and clean air action plans for Delhi residents.

---

## 📌 Overview

Ventura bridges the gap between awareness and practical daily action during severe Delhi winter smog. By combining real-time Open-Meteo air quality data with a four-question lifestyle assessment, Ventura delivers a prioritized personal action plan across four core areas:

1. **Sustainable Alternatives (Highlighted Focus):** Eco-friendly substitutions (such as HEPA filtration, DIY box fan filters, induction cooking, and Delhi Metro transit) suited for Delhi.
2. **Daily Routines:** Low-emission timing adjustments (e.g., shifting outdoor exposure to midday thermal inversion clearance hours).
3. **Indoor Air Hacks:** Simple, high-impact indoor interventions (door/window weatherstripping, exhaust timing, halting indoor incense combustion).
4. **Impact of Actions:** Transparent qualitative impact levels (**High**, **Medium**, **Low**) with guidance disclosures.

---

## 📁 Project Architecture

```
ventura/
├── data/
│   ├── __init__.py
│   └── air_quality.py          # Open-Meteo live API client, 30-min cache & fallbacks
├── rules/
│   ├── __init__.py
│   └── advice_rules.py         # Master rules table, pollutant logic & personalization
├── ui/
│   ├── __init__.py
│   ├── styles.py               # Earthy design palette, CSS styles & WCAG contrast
│   └── components.py           # Header, Air Status Card, Quick Start & Plan renderers
├── tests/
│   ├── __init__.py
│   ├── test_air_data.py        # Parsing, AQI categories, pollutant ratios & sample data
│   ├── test_cache.py           # 30-min TTL caching, network fallback & sample fallback
│   ├── test_rules.py           # Rules table, PM2.5/NO2 routing & dismissal tests
│   └── test_app_smoke.py       # End-to-end headless AppTest startup verification
├── app.py                      # Main Streamlit application entry point
├── requirements.txt            # Pinned production dependencies
├── .env.example                # Template configuration with placeholder values
├── .gitignore                  # Git exclusions (.env, caches, venv)
└── README.md                   # Documentation and test run results
```

---

## 🚀 Setup & Local Execution

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.12 and 3.14)
- Git

### 2. Clone Repository
```bash
git clone <repository-url>
cd ventura
```

### 3. Virtual Environment & Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt
```

### 4. Configuration
Ventura uses Open-Meteo's free public air quality API and **does not require an API key**.  
If you want to customize settings, copy `.env.example`:
```bash
cp .env.example .env
```

### 5. Run the Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 🧪 Test Suite & Results

Ventura includes automated unit and smoke tests using `pytest` and `streamlit.testing.v1.AppTest`.

### Running Tests
```bash
pytest -v
```

### Test Results
```text
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.2.0, pluggy-1.7.0
rootdir: D:\ventura
plugins: anyio-4.15.1
collected 17 items

tests/test_air_data.py::test_aqi_category_and_color PASSED               [  5%]
tests/test_air_data.py::test_calculate_dominant_pollutant PASSED         [ 11%]
tests/test_air_data.py::test_parse_air_quality_payload_success PASSED    [ 17%]
tests/test_air_data.py::test_parse_air_quality_payload_hourly_fallback PASSED [ 23%]
tests/test_air_data.py::test_parse_air_quality_payload_invalid PASSED    [ 29%]
tests/test_air_data.py::test_sample_reading_format PASSED                [ 35%]
tests/test_app_smoke.py::test_app_imports_cleanly PASSED                 [ 41%]
tests/test_app_smoke.py::test_app_startup_headless_run PASSED            [ 47%]
tests/test_cache.py::test_cache_returns_cached_reading_within_ttl PASSED [ 52%]
tests/test_cache.py::test_cache_refreshes_after_ttl_expires PASSED       [ 58%]
tests/test_cache.py::test_fallback_to_last_saved_reading_when_fetch_fails PASSED [ 64%]
tests/test_cache.py::test_fallback_to_sample_data_when_no_prior_reading PASSED [ 70%]
tests/test_rules.py::test_rules_table_structure_and_impact_levels PASSED [ 76%]
tests/test_rules.py::test_pm25_dominant_leads_to_masks_and_purifiers PASSED [ 82%]
tests/test_rules.py::test_no2_dominant_leads_to_traffic_and_cooking PASSED [ 88%]
tests/test_rules.py::test_personal_plan_four_required_areas_and_order PASSED [ 94%]
tests/test_rules.py::test_not_for_me_dismiss_functionality PASSED        [100%]

============================= 17 passed in 3.73s ==============================
```

---

## 🛡️ Security & Privacy Disclosures

- **Zero Data Retention:** Lifestyle answers and tip dismissals live strictly in ephemeral session state (`st.session_state`). No user data is written to disk or any remote database.
- **No Hardcoded Secrets:** Any configuration is retrieved via environment variables (`os.getenv`).
- **Resilient Fallbacks:** In the event of network disruption, the app displays the last verified reading with its timestamp, or the built-in sample baseline clearly labeled as `"Sample data"`.
- **Friendly Errors:** Unhandled exceptions and stack traces are suppressed from the user interface.

---

## 🎨 Accessibility & Design Notes

- **Color Contrast:** Deep charcoal text (`#231F20`) on warm cream (`#FAF7F2`) exceeds WCAG 2.1 AAA contrast requirements (> 12:1).
- **Dual Labeling:** Every color indicator (Good, Moderate, Poor, Very Poor, Hazardous) is accompanied by an explicit text badge.
- **Keyboard Navigation:** Native Streamlit radio and action buttons support tab navigation and screen readers.

