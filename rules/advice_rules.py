"""Rules module for pollutant-to-advice mapping and personalization.

Maps dominant pollutant (PM2.5 vs NO2) and user quick start answers
into structured recommendations across the four required areas:
1. Sustainable Alternatives (highlighted, first)
2. Daily Routines
3. Indoor Air Hacks
4. Impact of Actions

All rules and impact levels are maintained in a clean tabular structure in this single file.
All tips use plain language with no technical jargon (no MERV, FFP2, particulate)
and no percentages.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass
class AdviceItem:
    """Represents a single recommendation card in the plan."""
    id: str
    area: str  # 'sustainable_alternatives', 'daily_routines', 'indoor_hacks', 'action_impacts'
    tip: str
    impact_level: str  # 'High', 'Medium', 'Low'
    detail: str
    dominant_pollutant: str  # 'PM2.5', 'NO2', or 'ANY'
    tag: str
    is_highlighted: bool = False


# AREA DISPLAY NAMES (Strict order specified in PRDs)
AREA_DISPLAY_ORDER = [
    ("sustainable_alternatives", "SUSTAINABLE ALTERNATIVES", "Green choices suited for Delhi living"),
    ("daily_routines", "DAILY ROUTINES", "Low-emission daily timing and habits"),
    ("indoor_hacks", "INDOOR AIR HACKS", "Simple steps to keep indoor air clean"),
    ("action_impacts", "IMPACT OF ACTIONS", "What each action changes in your day"),
]


# MASTER RULES TABLE
# Single clean readable table holding all recommendations, triggers, and impact levels
# Strictly written in plain language with zero technical jargon and zero percentages
ADVICE_RULES_TABLE: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. SUSTAINABLE ALTERNATIVES (Highlighted, first)
    # -------------------------------------------------------------------------
    # PM2.5 Dominant: Clean air filters, fitted masks, leafy plants
    {
        "id": "sa_pm25_purifier",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "PM2.5",
        "tip": "Use a home air cleaner with a clean air filter instead of an ionic freshener.",
        "impact_level": "High",
        "detail": "Traps indoor dust and smoke safely without creating irritating ozone.",
        "tag": "Clean Air Tech",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_household": ["Someone with breathing sensitivities", "Older adults", "Children", "My whole household"],
        "trigger_routine": ["Mostly indoors", "A mix of everything"],
    },
    {
        "id": "sa_pm25_mask",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "PM2.5",
        "tip": "Wear a well-fitted snug mask whenever you head outside.",
        "impact_level": "High",
        "detail": "Blocks heavy smoke and soot from reaching your lungs on smoggy days.",
        "tag": "Personal Protection",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Spending lots of time outdoors", "Commuting around the city", "A mix of everything"],
    },
    {
        "id": "sa_pm25_plants",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "PM2.5",
        "tip": "Keep leafy indoor plants near doorways and windows to catch dust.",
        "impact_level": "Low",
        "detail": "Helps keep the room calm and settles floating dust naturally.",
        "tag": "Green Living",
        "trigger_focus": ["Keeping the air at home cleaner", "Making healthier everyday choices"],
        "trigger_household": ["Just me", "Children", "My whole household"],
    },

    # NO2 Dominant: Electric Cooking, Public Transit, Clean Mobility
    {
        "id": "sa_no2_cooking",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "NO2",
        "tip": "Cook on an electric induction hotplate instead of a gas flame for boiling and simmering.",
        "impact_level": "High",
        "detail": "Keeps cooking fumes and burned gas entirely out of your living space.",
        "tag": "Clean Cooking",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_household": ["Children", "Someone with breathing sensitivities", "Older adults", "My whole household"],
    },
    {
        "id": "sa_no2_metro",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "NO2",
        "tip": "Ride the Delhi Metro or an electric bus instead of driving in traffic.",
        "impact_level": "High",
        "detail": "Keeps you away from bumper-to-bumper vehicle exhaust on busy roads.",
        "tag": "Clean Transit",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Commuting around the city", "Spending lots of time outdoors"],
    },
    {
        "id": "sa_no2_carpool",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "NO2",
        "tip": "Share a ride with neighbors or book an electric cab for daily commutes.",
        "impact_level": "Medium",
        "detail": "Lowers the number of exhaust-producing cars idling on the roads.",
        "tag": "Shared Mobility",
        "trigger_focus": ["Making healthier everyday choices", "Staying safer when I'm outdoors"],
        "trigger_routine": ["Commuting around the city", "A mix of everything"],
    },

    # ANY Pollutant Alternatives
    {
        "id": "sa_any_solar",
        "area": "sustainable_alternatives",
        "dominant_pollutant": "ANY",
        "tip": "Choose high-efficiency rated appliances for your home.",
        "impact_level": "Medium",
        "detail": "Draws less power from city power plants and reduces overall smoke.",
        "tag": "Energy Efficiency",
        "trigger_focus": ["Making healthier everyday choices", "Keeping the air at home cleaner"],
    },

    # -------------------------------------------------------------------------
    # 2. DAILY ROUTINES
    # -------------------------------------------------------------------------
    # PM2.5 Dominant: Afternoon exposure timing, wet cleaning, sensitive care
    {
        "id": "dr_pm25_timing",
        "area": "daily_routines",
        "dominant_pollutant": "PM2.5",
        "tip": "Step outside for exercise or errands in the bright afternoon between noon and 4 PM.",
        "impact_level": "High",
        "detail": "Warmer afternoon air allows trapped ground smoke to lift and clear away.",
        "tag": "Timing",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Spending lots of time outdoors", "A mix of everything", "Commuting around the city"],
    },
    {
        "id": "dr_pm25_cleaning",
        "area": "daily_routines",
        "dominant_pollutant": "PM2.5",
        "tip": "Wipe and mop floors with a damp cloth instead of sweeping with a dry broom.",
        "impact_level": "Medium",
        "detail": "Stops settled dust from floating back up into the air you breathe.",
        "tag": "Habits",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_routine": ["Mostly indoors", "A mix of everything"],
    },
    {
        "id": "dr_pm25_kids",
        "area": "daily_routines",
        "dominant_pollutant": "PM2.5",
        "tip": "Keep young children and elderly family members indoors during chilly early mornings and nights.",
        "impact_level": "High",
        "detail": "Protects sensitive airways during the daily peak hours of thick smog.",
        "tag": "Sensitive Care",
        "trigger_focus": ["Protecting my family"],
        "trigger_household": ["Someone with breathing sensitivities", "Children", "Older adults", "My whole household"],
    },

    # NO2 Dominant: Traffic rush hours, kitchen timing, cabin air
    {
        "id": "dr_no2_traffic_hours",
        "area": "daily_routines",
        "dominant_pollutant": "NO2",
        "tip": "Stay away from busy ring roads during morning and evening rush hours.",
        "impact_level": "High",
        "detail": "Vehicle fumes build up heavily when traffic crawls during rush times.",
        "tag": "Timing",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Commuting around the city", "Spending lots of time outdoors"],
    },
    {
        "id": "dr_no2_recirculation",
        "area": "daily_routines",
        "dominant_pollutant": "NO2",
        "tip": "Set your car air vent to recirculation mode while driving.",
        "impact_level": "Medium",
        "detail": "Keeps outside exhaust fumes from being pulled directly into your cabin.",
        "tag": "Commuting",
        "trigger_focus": ["Staying safer when I'm outdoors"],
        "trigger_routine": ["Commuting around the city"],
    },
    {
        "id": "dr_no2_wfh",
        "area": "daily_routines",
        "dominant_pollutant": "NO2",
        "tip": "Work from home or travel at off-peak hours whenever your schedule allows.",
        "impact_level": "Medium",
        "detail": "Keeps you out of heavy roadway smog jams during the worst travel times.",
        "tag": "Work Schedule",
        "trigger_focus": ["Protecting my family", "Making healthier everyday choices"],
        "trigger_routine": ["Mostly indoors", "Commuting around the city"],
    },

    # -------------------------------------------------------------------------
    # 3. INDOOR AIR HACKS
    # -------------------------------------------------------------------------
    # PM2.5 Dominant: Sealing, air circulation, source control
    {
        "id": "ih_pm25_window_seal",
        "area": "indoor_hacks",
        "dominant_pollutant": "PM2.5",
        "tip": "Seal drafty window edges and door gaps with foam tape.",
        "impact_level": "High",
        "detail": "Keeps night smog from creeping inside your bedrooms through tiny cracks.",
        "tag": "Sealing",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_routine": ["Mostly indoors", "A mix of everything"],
    },
    {
        "id": "ih_pm25_no_incense",
        "area": "indoor_hacks",
        "dominant_pollutant": "PM2.5",
        "tip": "Pause lighting incense sticks, mosquito coils, and scented candles in closed rooms.",
        "impact_level": "High",
        "detail": "Burning items inside creates heavy indoor smoke just like the outdoor air.",
        "tag": "Source Control",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_household": ["Someone with breathing sensitivities", "Children", "Older adults", "My whole household"],
    },
    {
        "id": "ih_pm25_air_cleaner",
        "area": "indoor_hacks",
        "dominant_pollutant": "PM2.5",
        "tip": "Keep your room air cleaner running quietly while you sleep with windows closed.",
        "impact_level": "High",
        "detail": "Gives your lungs clean, calm air to rest and recharge through the night.",
        "tag": "Filtration",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_household": ["Someone with breathing sensitivities", "Older adults", "Children", "My whole household"],
    },

    # NO2 Dominant: Kitchen ventilation, flame checks, burner time
    {
        "id": "ih_no2_exhaust",
        "area": "indoor_hacks",
        "dominant_pollutant": "NO2",
        "tip": "Turn on the kitchen exhaust fan before lighting your stove and leave it on for a few minutes after.",
        "impact_level": "High",
        "detail": "Pulls cooking smoke and burner fumes straight outside before they spread.",
        "tag": "Ventilation",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_routine": ["Mostly indoors", "A mix of everything"],
    },
    {
        "id": "ih_no2_blue_flame",
        "area": "indoor_hacks",
        "dominant_pollutant": "NO2",
        "tip": "Check that your gas stove burns with a sharp blue flame rather than a yellow flame.",
        "impact_level": "Medium",
        "detail": "A steady blue flame burns cleanly and produces far fewer irritating fumes.",
        "tag": "Appliance Care",
        "trigger_focus": ["Keeping the air at home cleaner", "Making healthier everyday choices"],
    },
    {
        "id": "ih_no2_lids",
        "area": "indoor_hacks",
        "dominant_pollutant": "NO2",
        "tip": "Cover pots with tight lids and use pressure cookers to shorten your stovetop cooking time.",
        "impact_level": "Medium",
        "detail": "Using less gas time means fewer burning fumes released into your home.",
        "tag": "Kitchen Habit",
        "trigger_focus": ["Keeping the air at home cleaner", "Making healthier everyday choices"],
    },

    # -------------------------------------------------------------------------
    # 4. IMPACT OF ACTIONS
    # -------------------------------------------------------------------------
    {
        "id": "ia_mask_impact",
        "area": "action_impacts",
        "dominant_pollutant": "PM2.5",
        "tip": "Wearing a snug mask outdoors dramatically cuts the amount of soot you inhale.",
        "impact_level": "High",
        "detail": "General guidance: High impact on personal breathing comfort in smog.",
        "tag": "Personal Protection",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Spending lots of time outdoors", "Commuting around the city"],
    },
    {
        "id": "ia_purifier_impact",
        "area": "action_impacts",
        "dominant_pollutant": "PM2.5",
        "tip": "Running a clean air filter in a closed bedroom clears most floating dust and smoke.",
        "impact_level": "High",
        "detail": "General guidance: High impact on restful sleep and easier nighttime breathing.",
        "tag": "Home Protection",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
        "trigger_household": ["Someone with breathing sensitivities", "Older adults", "Children", "My whole household"],
    },
    {
        "id": "ia_cooking_impact",
        "area": "action_impacts",
        "dominant_pollutant": "NO2",
        "tip": "Running an exhaust fan while cooking clears away most gas fumes before they spread.",
        "impact_level": "High",
        "detail": "General guidance: High impact on keeping indoor room air fresh.",
        "tag": "Kitchen Safety",
        "trigger_focus": ["Keeping the air at home cleaner", "Protecting my family"],
    },
    {
        "id": "ia_transit_impact",
        "area": "action_impacts",
        "dominant_pollutant": "NO2",
        "tip": "Taking the Delhi Metro cuts your daily roadside exhaust exposure and lowers city traffic.",
        "impact_level": "High",
        "detail": "General guidance: High impact on reducing road smog and personal smoke exposure.",
        "tag": "City Impact",
        "trigger_focus": ["Staying safer when I'm outdoors", "Making healthier everyday choices"],
        "trigger_routine": ["Commuting around the city", "Spending lots of time outdoors"],
    },
    {
        "id": "ia_habits_impact",
        "area": "action_impacts",
        "dominant_pollutant": "ANY",
        "tip": "Shifting outdoor tasks to the afternoon lets you miss the worst morning smoke.",
        "impact_level": "Medium",
        "detail": "General guidance: Medium impact by timing your day with cleaner afternoon air.",
        "tag": "Daily Habits",
        "trigger_focus": ["Making healthier everyday choices", "Staying safer when I'm outdoors"],
        "trigger_routine": ["A mix of everything", "Spending lots of time outdoors"],
    },
]


def match_rule_score(rule: Dict[str, Any], dominant_pollutant: str, answers: Dict[str, str]) -> int:
    """Score a rule based on pollutant alignment and user quick-start answers."""
    score = 0

    # Pollutant match
    if rule["dominant_pollutant"] == dominant_pollutant:
        score += 10
    elif rule["dominant_pollutant"] == "ANY":
        score += 5
    else:
        score -= 2

    # Focus priority match (Question 1)
    # Answers: "Protecting my family", "Staying safer when I'm outdoors", "Keeping the air at home cleaner", "Making healthier everyday choices"
    focus_val = answers.get("focus") or answers.get("priority")
    focus_triggers = rule.get("trigger_focus", [])
    if focus_triggers and focus_val in focus_triggers:
        score += 7

    # Household demographic match (Question 2)
    # Answers: "Just me", "Children", "Older adults", "Someone with breathing sensitivities", "My whole household"
    # Backwards-compatible mappings supported:
    # "Family with children" -> "Children", "Older adults at home" -> "Older adults", "Someone with asthma" -> "Someone with breathing sensitivities"
    household_val = answers.get("household")
    if household_val:
        normalized_household = {
            "Family with children": "Children",
            "Older adults at home": "Older adults",
            "Someone with asthma": "Someone with breathing sensitivities",
        }.get(household_val, household_val)
        household_triggers = rule.get("trigger_household", [])
        if household_triggers and (normalized_household in household_triggers or household_val in household_triggers):
            score += 7

    # Daily routine match (Question 3)
    # Answers: "Mostly indoors", "Commuting around the city", "Spending lots of time outdoors", "A mix of everything"
    # Backwards-compatible mappings supported from old travel/outdoor:
    # "Car or two-wheeler" -> "Commuting around the city", "Walk or cycle" -> "Spending lots of time outdoors", "Mostly work from home" -> "Mostly indoors"
    routine_val = answers.get("routine") or answers.get("daily_routine")
    if not routine_val:
        travel_val = answers.get("travel")
        if travel_val in ["Car or two-wheeler", "Public transport"]:
            routine_val = "Commuting around the city"
        elif travel_val == "Walk or cycle":
            routine_val = "Spending lots of time outdoors"
        elif travel_val == "Mostly work from home":
            routine_val = "Mostly indoors"
        elif answers.get("outdoor_time") == "A lot":
            routine_val = "Spending lots of time outdoors"

    routine_triggers = rule.get("trigger_routine", [])
    if routine_triggers and routine_val in routine_triggers:
        score += 7

    return score


def get_personalized_plan(
    dominant_pollutant: str,
    answers: Optional[Dict[str, str]] = None,
    dismissed_ids: Optional[set[str]] = None,
) -> Dict[str, List[AdviceItem]]:
    """Generate categorized personalized recommendations according to PRD order.

    Order:
    1. sustainable_alternatives (highlighted, first)
    2. daily_routines
    3. indoor_hacks
    4. action_impacts
    """
    user_answers = answers or {}
    dismissed = dismissed_ids or set()

    # Normalize dominant pollutant
    dom = "PM2.5" if "PM" in dominant_pollutant.upper() else "NO2"

    plan: Dict[str, List[AdviceItem]] = {
        "sustainable_alternatives": [],
        "daily_routines": [],
        "indoor_hacks": [],
        "action_impacts": [],
    }

    # Group rules by area and score them
    for area_key in ["sustainable_alternatives", "daily_routines", "indoor_hacks", "action_impacts"]:
        candidates = [
            r for r in ADVICE_RULES_TABLE
            if r["area"] == area_key and r["id"] not in dismissed
        ]

        # Score and rank candidates
        scored_candidates = [
            (match_rule_score(r, dom, user_answers), r)
            for r in candidates
        ]
        # Sort descending by score
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        # Select top 2-3 tips per area
        selected = [item for _, item in scored_candidates[:3]]

        plan[area_key] = [
            AdviceItem(
                id=r["id"],
                area=r["area"],
                tip=r["tip"],
                impact_level=r["impact_level"],
                detail=r["detail"],
                dominant_pollutant=r["dominant_pollutant"],
                tag=r.get("tag", "Guidance"),
                is_highlighted=(area_key == "sustainable_alternatives"),
            )
            for r in selected
        ]

    return plan
