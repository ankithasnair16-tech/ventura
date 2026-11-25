"""UI component renderers for Ventura (Phase 1 Redesign).

Renders:
- Refined SaaS header and 2-line dynamic headline ("BREATHE BETTER. LIVE CLEANER.")
- Air quality status card (AQI number, level label, main pollutant)
- Quick start 4 assessment questions wrapped in a unified card container
- Personal plan with 4 cards in strict PRD order, each with impact level and 'Not for me' dismiss button
- Small footer with "Updated [time]" and tip restoration
"""

import streamlit as st
from typing import Dict, Any, List, Set
from data.air_quality import AirReading
from rules.advice_rules import AdviceItem, AREA_DISPLAY_ORDER, get_personalized_plan


def render_header() -> None:
    """Render the Ventura brand header and dynamic two-line headline."""
    st.markdown(
        """
        <div class="ventura-header">
            <span style="font-size: 20px;">🌿</span>
            <span class="ventura-logo-text">Ventura</span>
            <span class="live-dot-badge">• Delhi Live Air</span>
        </div>
        <div class="hero-headline-group">
            <h1 class="hero-headline-main">BREATHE BETTER.</h1>
            <h2 class="hero-headline-sub">LIVE CLEANER.</h2>
        </div>
        <p class="ventura-subheadline">
            Tailored daily actions and sustainable choices based on Delhi's live winter air.
        </p>
        """,
        unsafe_allow_html=True,
    )


def render_air_status_card(reading: AirReading) -> None:
    """Render the minimal, elegant air quality status card.

    Shows AQI number, color badge with text label, and main pollutant breakdown.
    """
    card_html = f"""
    <div class="air-status-card" role="region" aria-label="Delhi Air Quality Status">
        <div class="air-status-header">
            <span class="air-location">📍 Delhi (National Capital Territory)</span>
            <span class="air-source-label">{reading.source_label}</span>
        </div>
        <div class="air-reading-row">
            <div class="aqi-number" style="color: {reading.status_color};" aria-label="AQI {reading.aqi}">
                {reading.aqi}
            </div>
            <div>
                <span class="aqi-badge" style="background-color: {reading.status_color};">
                    {reading.category}
                </span>
                <div style="font-size: 13px; color: #5E7A66; margin-top: 5px; font-weight: 600;">
                    Air Quality Index
                </div>
            </div>
        </div>
        <div class="pollutant-metrics-grid">
            <div class="pollutant-item">
                <div class="pollutant-label">Main Pollutant</div>
                <div class="pollutant-value" style="color: #B85334;">{reading.dominant_pollutant}</div>
            </div>
            <div class="pollutant-item">
                <div class="pollutant-label">Fine Dust (PM2.5)</div>
                <div class="pollutant-value">{reading.pm2_5:.1f} <span style="font-size: 11px; font-weight: 500;">µg/m³</span></div>
            </div>
            <div class="pollutant-item">
                <div class="pollutant-label">Gas Fumes (NO₂)</div>
                <div class="pollutant-value">{reading.no2:.1f} <span style="font-size: 11px; font-weight: 500;">µg/m³</span></div>
            </div>
        </div>
    </div>
    """
    st.markdown(card_html, unsafe_allow_html=True)


def render_quick_start() -> Dict[str, str]:
    """Render the 4 quick start questions wrapped inside a unified card container.

    A selected option gets a filled forest green color and a check mark (✓),
    making the choice obvious without relying on color alone.
    Kept strictly in session memory.
    """
    answers: Dict[str, str] = {}

    # Question definitions: (key, title, options, default_index)
    questions = [
        (
            "quick_household",
            "1. Who lives with you?",
            [
                "Just me",
                "Family with children",
                "Older adults at home",
                "Someone with asthma",
            ],
            1,
        ),
        (
            "quick_travel",
            "2. How do you usually travel?",
            [
                "Walk or cycle",
                "Public transport",
                "Car or two-wheeler",
                "Mostly work from home",
            ],
            2,
        ),
        (
            "quick_cooking",
            "3. What do you cook with?",
            [
                "LPG or gas",
                "Induction or electric",
                "Wood or coal",
                "Not sure",
            ],
            0,
        ),
        (
            "quick_outdoor",
            "4. How much time do you spend outdoors?",
            [
                "Little",
                "Some",
                "A lot",
            ],
            1,
        ),
    ]

    # Native container wrapping fixes the previous unclosed DOM tag nesting issue
    with st.container(border=True):
        st.markdown(
            """
            <div class="section-title">⚡ QUICK START</div>
            <div class="section-subtitle">Tap an option in each category to tailor your daily plan:</div>
            """,
            unsafe_allow_html=True,
        )

        for q_key, q_title, options, default_idx in questions:
            if q_key not in st.session_state:
                st.session_state[q_key] = options[default_idx]

            st.markdown(
                f"<div style='font-weight: 700; font-size: 15px; margin: 12px 0 6px 0; color: #231F20;'>{q_title}</div>",
                unsafe_allow_html=True,
            )

            current_val = st.session_state[q_key]

            # 2-column grid of large tappable cards (44px min-height)
            cols = st.columns(2)
            for i, opt in enumerate(options):
                col = cols[i % 2]
                is_selected = (opt == current_val)
                button_label = f"✓ {opt}" if is_selected else opt
                button_type = "primary" if is_selected else "secondary"

                with col:
                    if st.button(
                        button_label,
                        key=f"btn_{q_key}_{i}",
                        type=button_type,
                        use_container_width=True,
                    ):
                        st.session_state[q_key] = opt
                        st.rerun()

            answers[q_key.replace("quick_", "")] = st.session_state[q_key]

    return answers


def render_personal_plan(
    dominant_pollutant: str,
    user_answers: Dict[str, str],
    dismissed_ids: Set[str],
) -> None:
    """Render the four plan cards in strict PRD order on one scrolling page:

    1. Sustainable alternatives (highlighted, first)
    2. Daily routines
    3. Indoor air hacks
    4. Impact of actions

    Each tip includes an impact level and a 44px 'Not for me' dismiss button.
    """
    plan = get_personalized_plan(
        dominant_pollutant=dominant_pollutant,
        answers=user_answers,
        dismissed_ids=dismissed_ids,
    )

    st.markdown(
        """
        <div class="plan-section-divider">
            <h2 class="plan-heading-title">YOUR PERSONAL PLAN</h2>
        </div>
        """,
        unsafe_allow_html=True,
    )

    for area_key, area_title, area_desc in AREA_DISPLAY_ORDER:
        tips: List[AdviceItem] = plan.get(area_key, [])
        is_highlighted = (area_key == "sustainable_alternatives")
        card_class = "section-card-highlighted" if is_highlighted else "section-card"

        header_badge = '<span class="highlight-pill">★ HIGHLIGHTED FOCUS</span>' if is_highlighted else ""
        st.markdown(
            f"""
            <div class="{card_class}">
                <div class="section-header-row">
                    <h3 class="section-title">{area_title}</h3>
                    {header_badge}
                </div>
                <div class="section-subtitle">{area_desc}</div>
            """,
            unsafe_allow_html=True,
        )

        if not tips:
            st.markdown(
                """
                <div style="font-size: 14px; color: #5E7A66; padding: 6px 0;">
                    All suggestions in this area have been dismissed.
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            for item in tips:
                impact_class = f"impact-badge-{item.impact_level.lower()}"
                tip_box_html = f"""
                <div class="tip-card">
                    <div class="tip-top-row">
                        <span class="tip-tag">{item.tag}</span>
                        <span class="{impact_class}">Impact: {item.impact_level}</span>
                    </div>
                    <div class="tip-text">{item.tip}</div>
                    <div class="tip-detail">{item.detail}</div>
                </div>
                """
                st.markdown(tip_box_html, unsafe_allow_html=True)

                # Solid rounded 'Not for me' button with 44px min tap height
                st.markdown("<div class='dismiss-btn-container'>", unsafe_allow_html=True)
                if st.button(
                    "✕ Not for me",
                    key=f"dismiss_{item.id}",
                    help="Hide this recommendation",
                    use_container_width=True,
                ):
                    st.session_state.dismissed_tips.add(item.id)
                    st.rerun()
                st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    # General guidance note as required by Master and Technical PRDs
    st.markdown(
        """
        <div class="disclaimer-text">
            Guidance note: Impact levels (High, Medium, Low) are general advisory estimates based on standard exposure reductions, not medical advice.
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_footer(timestamp: str) -> None:
    """Render footer with small 'Updated [time]' text and restore dismissed tips if needed."""
    dismissed_count = len(st.session_state.get("dismissed_tips", set()))
    if dismissed_count > 0:
        if st.button(f"↩ Restore {dismissed_count} Dismissed Tips", key="restore_tips_btn", use_container_width=True):
            st.session_state.dismissed_tips = set()
            st.rerun()

    st.markdown(
        f"""
        <div class="ventura-footer">
            Updated {timestamp} • Ventura Delhi Air
        </div>
        """,
        unsafe_allow_html=True,
    )
