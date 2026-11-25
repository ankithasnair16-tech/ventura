"""Smoke test for the Ventura Streamlit application startup."""

import pytest
from streamlit.testing.v1 import AppTest


def test_app_imports_cleanly():
    """Verify all Ventura core modules import cleanly with no missing dependencies."""
    import data.air_quality
    import rules.advice_rules
    import ui.styles
    import ui.components
    import app

    assert hasattr(data.air_quality, "AirQualityService")
    assert hasattr(rules.advice_rules, "get_personalized_plan")
    assert hasattr(app, "main")


def test_app_startup_headless_run():
    """Verify Streamlit app initializes and executes without unhandled exceptions."""
    # AppTest from streamlit.testing.v1 resolves relative to caller file
    at = AppTest.from_file("../app.py", default_timeout=15)
    at.run()

    # Verify no unhandled exceptions occurred
    assert not at.exception

    # Verify buttons for quick start option cards and dismiss actions are present
    assert len(at.button) >= 15
