"""Ventura - Clean Air & Winter Smog Action App for Delhi.

A Streamlit web application providing live air quality insights and personalized,
actionable guidance for Delhi residents.
"""

import logging
import streamlit as st
from typing import Set

from data.air_quality import AirQualityService, AirReading
from ui.styles import get_custom_css
from ui.components import (
    render_header,
    render_air_status_card,
    render_quick_start,
    render_personal_plan,
    render_footer,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ventura")

# Streamlit page setup
st.set_page_config(
    page_title="Ventura | Breathe Better. Live Cleaner.",
    page_icon="🌿",
    layout="centered",
    initial_sidebar_state="collapsed",
)


def init_session_state() -> None:
    """Initialize in-memory session variables (never persisted to disk/db)."""
    if "dismissed_tips" not in st.session_state:
        st.session_state.dismissed_tips = set()
    if "air_service" not in st.session_state:
        st.session_state.air_service = AirQualityService()


def main() -> None:
    """Main application routine."""
    init_session_state()

    # Apply earthy styling, Inter font, 44px tap buttons & 600px layout
    st.markdown(get_custom_css(), unsafe_allow_html=True)

    # 1. Header & Headline
    render_header()

    # 2. Air Quality Reading with error-safe fallback (auto-refreshed every 30 mins)
    air_service: AirQualityService = st.session_state.air_service
    reading: AirReading

    try:
        reading = air_service.get_air_quality()
    except Exception as exc:
        logger.error("Error retrieving air quality: %s", exc)
        st.warning("Live air sensors are temporarily unreachable. Displaying baseline data.")
        reading = air_service.get_air_quality(force_refresh=False)

    # Render Air Status Card
    render_air_status_card(reading)

    # 3. Quick Start Questions (large tappable cards, session memory only)
    user_answers = render_quick_start()

    # 4. Personal Plan (one scrolling page, 4 cards in strict order)
    dismissed_ids: Set[str] = st.session_state.dismissed_tips
    render_personal_plan(
        dominant_pollutant=reading.dominant_pollutant,
        user_answers=user_answers,
        dismissed_ids=dismissed_ids,
    )

    # 5. Footer with "Updated [time]"
    render_footer(reading.timestamp)


if __name__ == "__main__":
    main()
