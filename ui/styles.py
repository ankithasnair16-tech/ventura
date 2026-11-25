"""Earthy color palette and styling for Ventura according to Design PRD.

Colors:
- Background: Warm sand / off-white (#FAF7F2)
- Main text: Deep charcoal brown (#231F20)
- Primary accent: Forest olive green (#3D5A40)
- Secondary accent: Terracotta clay (#C15C3D)
- Cards: Soft cream (#FFFFFF) with subtle warm shadow
- Typography: Inter sans-serif everywhere, body >= 16px, headlines bold all-caps
- Buttons: Solid, rounded, 44px min-height, high-contrast labels in normal & hover
- Layout: 600px max-width on laptop, 16px padding around screen, 16px card spacing
"""

def get_custom_css() -> str:
    """Return CSS styling adhering to UI specifications and WCAG contrast."""
    return """
    <style>
    /* 1. Typography: Clean sans-serif (Inter) everywhere */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    html, body, [class*="css"], .stApp {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        background-color: #FAF7F2 !important;
        color: #231F20 !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
    }

    /* 2. Layout: Max 600px on laptop, single column on phone, 16px screen padding */
    .block-container {
        max-width: 600px !important;
        padding-top: 16px !important;
        padding-bottom: 24px !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    @media (max-width: 600px) {
        .block-container {
            max-width: 100% !important;
            padding: 16px !important;
        }
    }

    /* Hide standard Streamlit chrome */
    header[data-testid="stHeader"] {
        background-color: transparent !important;
    }
    footer {
        visibility: hidden;
    }

    /* Accessibility focus outlines */
    button:focus-visible, input:focus-visible, select:focus-visible {
        outline: 3px solid #3D5A40 !important;
        outline-offset: 2px !important;
    }

    /* Header styling */
    .ventura-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0 2px 0;
    }

    .ventura-logo-text {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #3D5A40;
        text-transform: uppercase;
        margin: 0;
    }

    /* Headlines: bold, all caps, one size larger than body (20px vs 16px) */
    .ventura-headline {
        font-size: 20px !important;
        font-weight: 800 !important;
        letter-spacing: 0.6px !important;
        color: #231F20 !important;
        text-transform: uppercase !important;
        margin: 6px 0 8px 0 !important;
        line-height: 1.3 !important;
    }

    .ventura-subheadline {
        font-size: 16px !important;
        color: #4A3E36 !important;
        margin-bottom: 16px !important;
        line-height: 1.4 !important;
        font-weight: 500 !important;
    }

    /* 16px space between cards */
    .air-status-card,
    .section-card,
    .section-card-highlighted {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 16px rgba(45, 36, 30, 0.06);
        border: 1px solid #EAE3D9;
        margin-bottom: 16px !important;
    }

    .section-card-highlighted {
        border: 2.5px solid #3D5A40 !important;
        box-shadow: 0 6px 20px rgba(61, 90, 64, 0.12) !important;
    }

    /* Air status layout */
    .air-status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        flex-wrap: wrap;
        gap: 6px;
    }

    .air-location {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.6px;
        color: #4A3E36;
        text-transform: uppercase;
    }

    .air-reading-row {
        display: flex;
        align-items: baseline;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 12px;
    }

    .aqi-number {
        font-size: 52px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -1px;
    }

    .aqi-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #FFFFFF;
    }

    .pollutant-metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid #EAE3D9;
    }

    .pollutant-item {
        background-color: #FAF7F2;
        padding: 10px 12px;
        border-radius: 10px;
    }

    .pollutant-label {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        color: #5A4E46;
        margin-bottom: 2px;
        letter-spacing: 0.5px;
    }

    .pollutant-value {
        font-size: 16px;
        font-weight: 700;
        color: #231F20;
    }

    /* Section Cards */
    .section-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        flex-wrap: wrap;
        gap: 6px;
    }

    .section-title {
        font-size: 18px !important;
        font-weight: 800 !important;
        letter-spacing: 0.6px !important;
        color: #231F20 !important;
        text-transform: uppercase !important;
        margin: 0 !important;
    }

    .section-subtitle {
        font-size: 14px;
        color: #5A4E46;
        margin-bottom: 14px;
    }

    .highlight-pill {
        background-color: #3D5A40;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        letter-spacing: 0.6px;
        text-transform: uppercase;
    }

    /* Tip Card inside section */
    .tip-card {
        background-color: #FAF7F2;
        border: 1px solid #EAE3D9;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 10px;
    }

    .tip-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
    }

    .tip-tag {
        font-size: 12px;
        font-weight: 700;
        color: #4A3E36;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .impact-badge-high {
        background-color: #B85334;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .impact-badge-medium {
        background-color: #B8860B;
        color: #231F20;
        font-size: 12px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .impact-badge-low {
        background-color: #3D5A40;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }

    .tip-text {
        font-size: 16px !important;
        font-weight: 600 !important;
        line-height: 1.45 !important;
        color: #231F20 !important;
        margin-bottom: 6px !important;
    }

    .tip-detail {
        font-size: 15px !important;
        color: #4A3E36 !important;
        line-height: 1.4 !important;
        margin-bottom: 6px !important;
    }

    /* 3. Buttons: Minimum 44px tap target, solid, rounded, clear contrast normal & hover */
    .stButton > button {
        min-height: 44px !important;
        height: auto !important;
        border-radius: 12px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        padding: 10px 16px !important;
        letter-spacing: 0.3px !important;
        transition: all 0.15s ease-in-out !important;
        cursor: pointer !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Inter', sans-serif !important;
    }

    /* Unselected Option / Secondary Button */
    .stButton > button[kind="secondary"] {
        background-color: #FFFFFF !important;
        color: #231F20 !important;
        border: 1.5px solid #D5CBBF !important;
    }

    .stButton > button[kind="secondary"]:hover {
        background-color: #F2EDE4 !important;
        color: #231F20 !important;
        border-color: #3D5A40 !important;
    }

    /* Selected Option / Primary Button (Filled earthy color + checkmark) */
    .stButton > button[kind="primary"] {
        background-color: #3D5A40 !important;
        color: #FFFFFF !important;
        border: 2px solid #3D5A40 !important;
        font-weight: 700 !important;
    }

    .stButton > button[kind="primary"]:hover {
        background-color: #2E4430 !important;
        color: #FFFFFF !important;
        border-color: #2E4430 !important;
    }

    /* "Not for me" dismiss button styling */
    .dismiss-btn-container .stButton > button {
        background-color: #FFFFFF !important;
        color: #9C3E20 !important;
        border: 1.5px solid #B85334 !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        min-height: 44px !important;
    }

    .dismiss-btn-container .stButton > button:hover {
        background-color: #B85334 !important;
        color: #FFFFFF !important;
        border-color: #B85334 !important;
    }

    /* Footer styling */
    .ventura-footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #EAE3D9;
        text-align: center;
        font-size: 13px;
        color: #5A4E46;
    }

    .disclaimer-text {
        font-size: 13px;
        color: #5A4E46;
        font-style: italic;
        margin-top: 14px;
        text-align: center;
        line-height: 1.4;
    }
    </style>
    """
