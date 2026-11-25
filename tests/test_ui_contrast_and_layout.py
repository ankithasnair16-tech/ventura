"""Unit tests for UI contrast compliance (WCAG 4.5:1) and layout rules."""

import math
from ui.styles import get_custom_css


def calculate_relative_luminance(hex_color: str) -> float:
    """Calculate relative luminance of an sRGB color per WCAG 2.1 specs."""
    hex_clean = hex_color.lstrip("#")
    r_val = int(hex_clean[0:2], 16) / 255.0
    g_val = int(hex_clean[2:4], 16) / 255.0
    b_val = int(hex_clean[4:6], 16) / 255.0

    def adjust(channel: float) -> float:
        if channel <= 0.03928:
            return channel / 12.92
        return math.pow((channel + 0.055) / 1.055, 2.4)

    r_lum = adjust(r_val)
    g_lum = adjust(g_val)
    b_lum = adjust(b_val)

    return 0.2126 * r_lum + 0.7152 * g_lum + 0.0722 * b_lum


def calculate_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate WCAG contrast ratio between two colors: (L1 + 0.05) / (L2 + 0.05)."""
    lum1 = calculate_relative_luminance(hex1)
    lum2 = calculate_relative_luminance(hex2)
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)


def test_text_contrast_meets_wcag_4_5_to_1():
    """Verify that all core text and background color pairs meet or exceed 4.5:1 contrast."""
    # Main charcoal text (#231F20) on Sand background (#FAF7F2)
    contrast_body = calculate_contrast_ratio("#231F20", "#FAF7F2")
    assert contrast_body >= 4.5, f"Body text contrast {contrast_body:.2f} is under 4.5"
    assert contrast_body > 12.0  # Actually ~14.8:1!

    # Main charcoal text (#231F20) on White Card (#FFFFFF)
    contrast_card_text = calculate_contrast_ratio("#231F20", "#FFFFFF")
    assert contrast_card_text >= 4.5

    # Secondary text (#4A3E36) on Sand background (#FAF7F2)
    contrast_sub = calculate_contrast_ratio("#4A3E36", "#FAF7F2")
    assert contrast_sub >= 4.5, f"Subtitle contrast {contrast_sub:.2f} is under 4.5"

    # White text (#FFFFFF) on Primary Green (#3D5A40)
    contrast_green_btn = calculate_contrast_ratio("#FFFFFF", "#3D5A40")
    assert contrast_green_btn >= 4.5, f"Green button contrast {contrast_green_btn:.2f} is under 4.5"

    # White text (#FFFFFF) on Terracotta Clay (#B85334)
    contrast_clay = calculate_contrast_ratio("#FFFFFF", "#B85334")
    assert contrast_clay >= 4.5, f"Terracotta badge contrast {contrast_clay:.2f} is under 4.5"

    # Dark text (#231F20) on Golden Yellow (#B8860B)
    contrast_yellow = calculate_contrast_ratio("#231F20", "#B8860B")
    assert contrast_yellow >= 4.5, f"Yellow badge contrast {contrast_yellow:.2f} is under 4.5"

    # White text (#FFFFFF) on Very Poor Red (#C0392B)
    contrast_red = calculate_contrast_ratio("#FFFFFF", "#C0392B")
    assert contrast_red >= 4.5

    # White text (#FFFFFF) on Hazardous Purple (#6C3483)
    contrast_purple = calculate_contrast_ratio("#FFFFFF", "#6C3483")
    assert contrast_purple >= 4.5


def test_css_layout_and_button_specs():
    """Verify that CSS contains the required layout, padding, font, and button sizing constraints."""
    css = get_custom_css()

    # Max width 600px
    assert "max-width: 600px" in css

    # 16px screen padding
    assert "padding-left: 16px" in css
    assert "padding-right: 16px" in css

    # 16px space between cards
    assert "margin-bottom: 16px" in css

    # 44px min tap button height
    assert "min-height: 44px" in css

    # Inter font
    assert "Inter" in css

    # Media query for phone width (max-width: 600px)
    assert "@media (max-width: 600px)" in css
