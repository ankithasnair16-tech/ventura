"""Earthy, minimal, and premium SaaS styling for Ventura according to Phase 1 Redesign.

Design Tokens:
- Canvas background: Warm ivory (#FBF9F5)
- Cards: Clean white (#FFFFFF) with subtle border (#EAE5DC) and soft shadow
- Primary accent: Deep forest green (#2E4D36 / #3D5A40)
- Secondary accent: Muted sage (#5E7A66 / #6C8573)
- Restrained accent: Terracotta clay (#B85334)
- Charcoal typography: Primary (#231F20), Secondary (#4A3E36)
- Typography: Clean Inter sans-serif throughout, refined hierarchy
- Buttons: Solid, rounded, 44px minimum tap target, high-contrast normal & hover
- Layout: 600px max-width container, 16px screen padding, 16px card spacing
"""

def get_custom_css() -> str:
    """Return CSS styling adhering to Phase 1 design specifications and WCAG contrast."""
    return """
    <style>
    /* 1. Typography: Clean sans-serif (Inter) everywhere */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    html, body, [class*="css"], .stApp {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        background-color: #FBF9F5 !important;
        color: #231F20 !important;
        font-size: 16px !important;
        line-height: 1.5 !important;
    }

    /* 2. Layout: 600px max-width on desktop, single column on phone, 16px screen padding */
    .block-container {
        max-width: 600px !important;
        padding-top: 20px !important;
        padding-bottom: 32px !important;
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

    /* Hide standard Streamlit header & footer */
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

    /* Brand Header */
    .ventura-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0 6px 0;
    }

    .ventura-logo-text {
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 1.2px;
        color: #3D5A40;
        text-transform: uppercase;
        margin: 0;
    }

    .live-dot-badge {
        font-size: 12px;
        font-weight: 600;
        color: #5E7A66;
        letter-spacing: 0.4px;
        margin-left: 4px;
    }

    /* Hero headline group with dynamic mixed scale */
    .hero-headline-group {
        margin: 6px 0 10px 0;
    }

    .hero-headline-main {
        font-size: 26px !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px !important;
        color: #231F20 !important;
        text-transform: uppercase !important;
        margin: 0 0 2px 0 !important;
        line-height: 1.25 !important;
    }

    .hero-headline-sub {
        font-size: 20px !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        color: #3D5A40 !important;
        text-transform: uppercase !important;
        margin: 0 !important;
        line-height: 1.3 !important;
    }

    .ventura-subheadline {
        font-size: 15px !important;
        color: #4A3E36 !important;
        margin-bottom: 18px !important;
        line-height: 1.45 !important;
        font-weight: 450 !important;
    }

    /* Unified Cards: Subtle borders, clean ivory/white depth, 16px space between cards */
    .air-status-card,
    .section-card,
    .section-card-highlighted,
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background-color: #FFFFFF !important;
        border-radius: 16px !important;
        border: 1px solid #EAE5DC !important;
        box-shadow: 0 4px 20px rgba(35, 31, 32, 0.04) !important;
        margin-bottom: 16px !important;
        padding: 22px 20px !important;
    }

    .section-card-highlighted {
        border: 2px solid #3D5A40 !important;
        box-shadow: 0 6px 24px rgba(61, 90, 64, 0.08) !important;
    }

    /* Air Status Card Layout */
    .air-status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        flex-wrap: wrap;
        gap: 6px;
    }

    .air-location {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.8px;
        color: #4A3E36;
        text-transform: uppercase;
    }

    .air-source-label {
        font-size: 13px;
        color: #5E7A66;
        font-weight: 600;
    }

    .air-reading-row {
        display: flex;
        align-items: baseline;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 14px;
    }

    .aqi-number {
        font-size: 54px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -1.5px;
    }

    .aqi-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #FFFFFF;
    }

    .pollutant-metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid #F0ECE4;
    }

    .pollutant-item {
        background-color: #FBF9F5;
        border: 1px solid #F0ECE4;
        padding: 10px 14px;
        border-radius: 12px;
    }

    .pollutant-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #5E7A66;
        margin-bottom: 3px;
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
        letter-spacing: 0.8px !important;
        color: #231F20 !important;
        text-transform: uppercase !important;
        margin: 0 !important;
    }

    .section-subtitle {
        font-size: 14px;
        color: #4A3E36;
        margin-bottom: 14px;
        line-height: 1.4;
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

    /* Tip Card Inside Plan */
    .tip-card {
        background-color: #FBF9F5;
        border: 1px solid #EAE5DC;
        border-radius: 14px;
        padding: 16px 18px;
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
        font-size: 11px;
        font-weight: 700;
        color: #5E7A66;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    .impact-badge-high {
        background-color: #B85334;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .impact-badge-medium {
        background-color: #B8860B;
        color: #231F20;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .impact-badge-low {
        background-color: #3D5A40;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .tip-text {
        font-size: 16px !important;
        font-weight: 600 !important;
        line-height: 1.45 !important;
        color: #231F20 !important;
        margin-bottom: 5px !important;
    }

    .tip-detail {
        font-size: 14px !important;
        color: #4A3E36 !important;
        line-height: 1.45 !important;
        margin-bottom: 4px !important;
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
        border: 1.5px solid #E2DCD2 !important;
        box-shadow: 0 2px 6px rgba(35, 31, 32, 0.02) !important;
    }

    .stButton > button[kind="secondary"]:hover {
        background-color: #F7F4EE !important;
        color: #231F20 !important;
        border-color: #5E7A66 !important;
    }

    /* Selected Option / Primary Button (Deep Forest Green + Checkmark) */
    .stButton > button[kind="primary"] {
        background-color: #3D5A40 !important;
        color: #FFFFFF !important;
        border: 2px solid #3D5A40 !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(61, 90, 64, 0.18) !important;
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
        box-shadow: none !important;
    }

    .dismiss-btn-container .stButton > button:hover {
        background-color: #B85334 !important;
        color: #FFFFFF !important;
        border-color: #B85334 !important;
    }

    /* Section divider */
    .plan-section-divider {
        margin: 24px 0 16px 0;
        text-align: left;
    }

    .plan-heading-title {
        font-size: 20px !important;
        font-weight: 800 !important;
        letter-spacing: 0.8px !important;
        color: #231F20 !important;
        text-transform: uppercase !important;
        margin: 0 !important;
    }

    /* Footer styling */
    .ventura-footer {
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid #EAE5DC;
        text-align: center;
        font-size: 13px;
        color: #5E7A66;
        font-weight: 500;
    }

    .disclaimer-text {
        font-size: 13px;
        color: #5E7A66;
        font-style: italic;
        margin-top: 16px;
        text-align: center;
        line-height: 1.45;
    }
    </style>
    """
