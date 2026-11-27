"""Unit tests for the rules module, pollutant matching, plan generation, and plain-language tip text."""

from rules.advice_rules import (
    ADVICE_RULES_TABLE,
    get_personalized_plan,
    AREA_DISPLAY_ORDER,
)


def test_rules_table_structure_and_impact_levels():
    """Verify rules table completeness and validity."""
    assert len(ADVICE_RULES_TABLE) >= 12

    for rule in ADVICE_RULES_TABLE:
        assert "id" in rule
        assert "area" in rule
        assert rule["area"] in [
            "sustainable_alternatives",
            "daily_routines",
            "indoor_hacks",
            "action_impacts",
        ]
        assert "tip" in rule
        assert len(rule["tip"]) > 0
        assert "impact_level" in rule
        assert rule["impact_level"] in ["High", "Medium", "Low"]
        assert rule["dominant_pollutant"] in ["PM2.5", "NO2", "ANY"]


def test_plain_language_no_jargon_or_percentages():
    """Verify that NO tips or details contain percentages or technical terms (MERV, FFP2, particulate)."""
    forbidden_terms = [
        "%",
        "percent",
        "merv",
        "ffp2",
        "n95",
        "particulate",
        "inversion",
        "micro-fiber",
    ]

    for rule in ADVICE_RULES_TABLE:
        text_to_check = f"{rule['tip']} {rule['detail']}".lower()
        for forbidden in forbidden_terms:
            assert forbidden not in text_to_check, (
                f"Rule {rule['id']} contains forbidden term '{forbidden}': '{rule['tip']}' / '{rule['detail']}'"
            )


def test_pm25_dominant_leads_to_masks_and_purifiers():
    """Test that PM2.5 dominant pollutant selects mask and clean air filter advice in plain language."""
    plan = get_personalized_plan(
        dominant_pollutant="PM2.5",
        answers={"household": "Family with children", "travel": "Car or two-wheeler"},
    )

    all_tips_text = " ".join(
        item.tip.lower() for area in plan.values() for item in area
    )

    assert "mask" in all_tips_text
    assert "filter" in all_tips_text or "air cleaner" in all_tips_text


def test_no2_dominant_leads_to_traffic_and_cooking():
    """Test that NO2 dominant pollutant selects traffic and cooking advice in plain language."""
    plan = get_personalized_plan(
        dominant_pollutant="NO2",
        answers={"travel": "Car or two-wheeler", "cooking": "LPG or gas"},
    )

    all_tips_text = " ".join(
        item.tip.lower() for area in plan.values() for item in area
    )

    assert "cook" in all_tips_text or "induction" in all_tips_text or "exhaust" in all_tips_text
    assert "traffic" in all_tips_text or "metro" in all_tips_text or "rush hours" in all_tips_text


def test_personal_plan_four_required_areas_and_order():
    """Verify plan contains all 4 required areas in exact order with highlighted alternatives."""
    plan = get_personalized_plan(dominant_pollutant="PM2.5")

    expected_areas = [area_key for area_key, _, _ in AREA_DISPLAY_ORDER]
    assert list(plan.keys()) == expected_areas

    # Verify first card (Sustainable alternatives) is highlighted
    sa_items = plan["sustainable_alternatives"]
    assert len(sa_items) > 0
    for item in sa_items:
        assert item.is_highlighted is True

    # Verify other cards are not marked as primary highlighted card
    for item in plan["daily_routines"]:
        assert item.is_highlighted is False


def test_not_for_me_dismiss_functionality():
    """Verify that dismissed tip IDs are filtered out of the plan."""
    initial_plan = get_personalized_plan(dominant_pollutant="PM2.5")
    first_item = initial_plan["sustainable_alternatives"][0]
    dismissed_id = first_item.id

    updated_plan = get_personalized_plan(
        dominant_pollutant="PM2.5",
        dismissed_ids={dismissed_id},
    )

    updated_sa_ids = [item.id for item in updated_plan["sustainable_alternatives"]]
    assert dismissed_id not in updated_sa_ids


def test_new_questionnaire_answers_influence_plan():
    """Verify that all 3 new answers (focus, household, routine) genuinely influence recommendations."""
    # Scenario A: Home focus, sensitive household, mostly indoors
    plan_home = get_personalized_plan(
        dominant_pollutant="PM2.5",
        answers={
            "focus": "Keeping the air at home cleaner",
            "household": "Someone with breathing sensitivities",
            "routine": "Mostly indoors",
        },
    )
    home_sa_tips = [t.tip for t in plan_home["sustainable_alternatives"]]
    home_dr_tips = [t.tip for t in plan_home["daily_routines"]]
    # Top sustainable alternative should prioritize home air cleaner
    assert any("air cleaner" in t.lower() or "filter" in t.lower() for t in home_sa_tips)
    # Routine should prioritize cleaning / sensitive care over outdoor timing
    assert any("mop" in t.lower() or "wipe" in t.lower() or "chilly" in t.lower() for t in home_dr_tips)

    # Scenario B: Outdoor focus, just me, spending lots of time outdoors
    plan_outdoor = get_personalized_plan(
        dominant_pollutant="PM2.5",
        answers={
            "focus": "Staying safer when I'm outdoors",
            "household": "Just me",
            "routine": "Spending lots of time outdoors",
        },
    )
    outdoor_sa_tips = [t.tip for t in plan_outdoor["sustainable_alternatives"]]
    outdoor_dr_tips = [t.tip for t in plan_outdoor["daily_routines"]]
    # Top sustainable alternative should prioritize snug mask
    assert any("mask" in t.lower() for t in outdoor_sa_tips)
    # Top routine should prioritize afternoon timing
    assert any("afternoon" in t.lower() or "outside" in t.lower() for t in outdoor_dr_tips)

    # Compare rank scores: mask should score higher in outdoor scenario than home scenario
    from rules.advice_rules import match_rule_score, ADVICE_RULES_TABLE
    mask_rule = next(r for r in ADVICE_RULES_TABLE if r["id"] == "sa_pm25_mask")
    score_outdoor = match_rule_score(mask_rule, "PM2.5", {"focus": "Staying safer when I'm outdoors", "routine": "Spending lots of time outdoors"})
    score_home = match_rule_score(mask_rule, "PM2.5", {"focus": "Keeping the air at home cleaner", "routine": "Mostly indoors"})
    assert score_outdoor > score_home

    purifier_rule = next(r for r in ADVICE_RULES_TABLE if r["id"] == "sa_pm25_purifier")
    score_purifier_home = match_rule_score(purifier_rule, "PM2.5", {"focus": "Keeping the air at home cleaner", "household": "Someone with breathing sensitivities"})
    score_purifier_outdoor = match_rule_score(purifier_rule, "PM2.5", {"focus": "Staying safer when I'm outdoors", "household": "Just me"})
    assert score_purifier_home > score_purifier_outdoor
