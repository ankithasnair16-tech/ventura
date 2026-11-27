import {
  AirQualityData,
  CheckInMood,
  ExploreCard,
  OnboardingProfile,
  PlanRecommendation,
  ZoneOption,
} from '../types/ventura';

export const DELHI_ZONES_LIST: ZoneOption[] = [
  { id: 'lodhi-road',       name: 'Lodhi Road, Central Delhi',    lat: 28.5918, lon: 77.2273 },
  { id: 'hauz-khas',        name: 'Hauz Khas, South Delhi',       lat: 28.5494, lon: 77.2001 },
  { id: 'saket',            name: 'Saket, South Delhi',           lat: 28.5244, lon: 77.2066 },
  { id: 'connaught-place',  name: 'Connaught Place, New Delhi',   lat: 28.6315, lon: 77.2167 },
  { id: 'anand-vihar',      name: 'Anand Vihar, East Delhi',      lat: 28.6469, lon: 77.3153 },
  { id: 'dwarka',           name: 'Dwarka Sector 8, West Delhi',  lat: 28.5921, lon: 77.0460 },
  { id: 'rohini',           name: 'Rohini, North Delhi',          lat: 28.7495, lon: 77.1130 },
  { id: 'gurugram',         name: 'DLF Phase IV, Gurugram',       lat: 28.4595, lon: 77.0266 },
  { id: 'noida',            name: 'Sector 62, Noida',             lat: 28.6273, lon: 77.3722 },
];

export const GENERATED_IMAGES = {
  homeMorning: '/src/assets/images/aqi_delhi_morning_1795674037405.jpg',
  sustainableAlt: '/src/assets/images/explore_sustainable_alt_1795674038788.jpg',
  dailyRoutines: '/src/assets/images/explore_daily_routines_1795674038040.jpg',
  indoorAir: '/src/assets/images/explore_indoor_air_1795674039125.jpg',
};

export interface OnboardingQuestion {
  step: number;
  id: keyof Pick<OnboardingProfile, 'priority' | 'household' | 'routine'>;
  prompt: string;
  helper: string;
  options: Array<{
    label: string;
    detail: string;
  }>;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    step: 1,
    id: 'priority',
    prompt: 'What matters most to you right now?',
    helper: 'Pick the main thing you want help managing this week.',
    options: [
      {
        label: 'Protecting my family.',
        detail: 'School runs, outdoor play timing, and calmer rooms at home.',
      },
      {
        label: 'Staying safer outdoors.',
        detail: 'When to step out, cleaner transit routes, and proper masks.',
      },
      {
        label: 'Keeping the air at home cleaner.',
        detail: 'Cutting indoor smoke, kitchen fumes, and road dust.',
      },
      {
        label: 'Making healthier everyday choices.',
        detail: 'Practical low-emission swaps that don’t add extra hassle.',
      },
    ],
  },
  {
    step: 2,
    id: 'household',
    prompt: 'Who should Ventura keep in mind?',
    helper: 'Different ages and lungs react differently to winter smog.',
    options: [
      {
        label: 'Just me.',
        detail: 'Built around your own commute, errands, and flat.',
      },
      {
        label: 'Children.',
        detail: 'Bus-stop exposure, school timings, and indoor floor dust.',
      },
      {
        label: 'Older adults.',
        detail: 'Warmth without smoky coils and safer afternoon walk hours.',
      },
      {
        label: 'Someone with breathing sensitivities.',
        detail: 'Strict smoke-free rooms and high-PM2.5 warnings.',
      },
      {
        label: 'My whole household.',
        detail: 'Shared kitchen exhaust, cleaning, and evening window habits.',
      },
    ],
  },
  {
    step: 3,
    id: 'routine',
    prompt: 'What does a typical day look like?',
    helper: 'So the advice actually fits your schedule.',
    options: [
      {
        label: 'Mostly indoors.',
        detail: 'Working or studying from home with short local errands.',
      },
      {
        label: 'Commuting around the city.',
        detail: 'Metro, auto, cab, or two-wheeler trips during peak hours.',
      },
      {
        label: 'Spending lots of time outdoors.',
        detail: 'Field work, campus movement, or regular outdoor exercise.',
      },
      {
        label: 'A mix of everything.',
        detail: 'Office days, errands, and evenings at home.',
      },
    ],
  },
];

export const DEFAULT_PROFILE: OnboardingProfile = {
  priority: 'Making healthier everyday choices.',
  household: 'My whole household.',
  routine: 'A mix of everything.',
  completed: false,
};

export interface TimeOfDaySummary {
  badge: string;
  headline: string;
  guidance: string;
}

export function getTimeOfDaySummary(
  aqi: number,
  currentDate: Date = new Date()
): TimeOfDaySummary {
  const hour = currentDate.getHours() + currentDate.getMinutes() / 60;

  if (hour >= 5 && hour < 11.5) {
    return {
      badge: 'Morning Forecast',
      headline:
        aqi >= 200
          ? 'Heavy morning haze—delay outdoor exercise'
          : 'Crisper start before mid-morning traffic',
      guidance:
        aqi >= 200
          ? 'Cool surface air is trapping overnight exhaust until late morning. Expect noticeably lighter air between 1:00 PM and 4:00 PM.'
          : 'Air is relatively steady right now. Finish outdoor errands before midday traffic builds.',
    };
  }

  if (hour >= 11.5 && hour < 16.5) {
    return {
      badge: 'Afternoon Window',
      headline:
        aqi >= 250
          ? 'Peak warmth—brief errands only, with an N95'
          : 'Best window of the day for errands & airing',
      guidance:
        aqi >= 250
          ? 'Even in afternoon sun, particulate levels remain high today. Keep trips short and wear a well-sealed mask.'
          : 'Daytime warmth has lifted the morning smog layer. Good time to step out or crack windows for 15 minutes before dusk.',
    };
  }

  if (hour >= 16.5 && hour < 21) {
    return {
      badge: 'Evening Update',
      headline:
        aqi >= 200
          ? 'Air is thickening after sunset—seal up indoors'
          : 'Evening rush building near main roads',
      guidance:
        aqi >= 200
          ? 'Cooling air traps evening traffic exhaust near street level. Latch balcony doors, skip incense, and keep evening walks indoors.'
          : 'Traffic emissions peak around junctions right now. Take inner colony streets if walking back from the Metro.',
    };
  }

  return {
    badge: 'Night Update',
    headline:
      aqi >= 200
        ? 'Overnight inversion settling—keep bedrooms sealed'
        : 'Quiet night air—prepare for tomorrow morning',
    guidance:
      aqi >= 200
        ? 'Cold night air prevents pollutants from dispersing. Keep door gaps covered and skip coil heaters or agarbatti indoors.'
        : 'Conditions are calm overnight. Check the Morning Forecast before heading out early tomorrow.',
  };
}

export function buildShareNote(airQuality: AirQualityData | null): string {
  if (!airQuality) {
    return 'Delhi air update via Ventura: Keep balcony doors latched after sunset, wet-mop instead of dry sweeping, and carry a fitted FFP2/N95 mask outdoors.';
  }
  const summary = getTimeOfDaySummary(airQuality.aqi);
  return `${airQuality.zoneName} is ${airQuality.aqi} AQI (${airQuality.status}, PM2.5 ${airQuality.pm25} µg/m³) — ${summary.badge}: ${summary.headline}. Best outdoor window is 1–4 PM; pack a fitted N95 mask & close balcony doors before 5 PM.`;
}

export function buildPersonalizedPlan(
  profile: OnboardingProfile,
  airQuality: AirQualityData | null,
  currentHour: number = new Date().getHours(),
  mood?: CheckInMood | null
): PlanRecommendation[] {
  const aqi = airQuality?.aqi ?? 248;
  const isHighAqi = aqi >= 200;
  const isClear = aqi <= 100;
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isEvening = currentHour >= 17 || currentHour < 5;

  const isCommuter =
    profile.routine === 'Commuting around the city.' ||
    profile.routine === 'A mix of everything.';
  const hasSensitive =
    profile.household === 'Children.' ||
    profile.household === 'Older adults.' ||
    profile.household === 'Someone with breathing sensitivities.' ||
    profile.household === 'My whole household.';

  const sustainable: PlanRecommendation[] = [
    {
      id: 'sus-metro-ev',
      section: 'sustainable',
      title: isCommuter
        ? 'Take Metro + shared e-rickshaw instead of short cab hops'
        : 'Walk inner colony lanes or take an EV auto for errands',
      explanation: 'Avoids sitting behind idling diesel buses and peak signal exhaust.',
      benefit: 'Cuts street-level NO2 inhalation and avoids extra fuel trips',
      impact: 'High',
      howTo: 'Enter stations from pedestrian side gates rather than main traffic roundabouts when possible.',
      estimatedMinutes: 'Daily commute',
    },
    {
      id: 'sus-clean-warmth',
      section: 'sustainable',
      title: 'Skip indoor incense, coils, and exposed rod heaters',
      explanation: 'Agarbatti, dhoop, and burning coils send indoor PM2.5 soaring inside closed flats.',
      benefit: 'Removes the biggest avoidable source of indoor smoke',
      impact: 'High',
      howTo: 'Block drafts under balcony doors with rolled towels, and use warm layers or an oil-filled radiator if needed.',
      estimatedMinutes: 'Evening habit',
    },
    {
      id: 'sus-reusable-mask',
      section: 'sustainable',
      title: isClear
        ? 'Keep a clean reusable mask handy for dusty road work'
        : 'Rotate two fitted reusable FFP2/N95 masks',
      explanation: 'A cloth scarf won’t stop PM2.5; airing two FFP2 masks extends use without daily trash.',
      benefit: 'Blocks fine particles properly while cutting single-use waste',
      impact: isHighAqi ? 'High' : 'Medium',
      howTo: 'Pinch the nose wire tightly so glasses don’t fog, and air each mask dry in a cotton pouch between days.',
      estimatedMinutes: 'When stepping out',
    },
  ];

  const routines: PlanRecommendation[] = [
    {
      id: 'rou-midday-window',
      section: 'routines',
      title: isHighAqi
        ? isMorning
          ? 'Hold outdoor walks until 1:00 PM – 4:00 PM'
          : isEvening
            ? 'Move outdoor tasks indoors until tomorrow afternoon'
            : 'Use the 1:00 PM – 4:00 PM window for errands'
        : 'Good day for an outdoor walk before rush hour',
      explanation: isHighAqi
        ? 'Afternoon warmth temporarily lifts Delhi’s winter inversion layer.'
        : 'Lower AQI today makes moderate outdoor time comfortable.',
      benefit: 'Avoids the thickest morning and post-sunset smog hours',
      impact: 'High',
      howTo: 'Batch market stops, school pickups, or brief sun breaks during early afternoon hours.',
      estimatedMinutes: 'Timing shift',
    },
    {
      id: 'rou-recovery-tea',
      section: 'routines',
      title:
        mood === 'throat' || hasSensitive
          ? 'Warm saline gargle, face rinse & extra fluids today'
          : 'Change outer jacket and wash hands upon returning home',
      explanation:
        mood === 'throat'
          ? 'Soothes dry, smoke-irritated airways before going to sleep.'
          : 'Clears settled soot from skin and airways before it irritates your throat.',
      benefit: 'Keeps road dust off couches, pillows, and shared rooms',
      impact: mood === 'throat' ? 'High' : 'Medium',
      howTo: 'Leave street shoes on a mat by the main door and sip warm water or ginger tea after dusty commutes.',
      estimatedMinutes: '3 min reset',
    },
    {
      id: 'rou-route-shift',
      section: 'routines',
      title: 'Walk one street inside away from main arterial roads',
      explanation: 'Traffic exhaust drops noticeably even 100 meters away from busy signals.',
      benefit: 'Reduces direct tailpipe fumes while walking',
      impact: 'Medium',
      howTo: 'Cut through neighborhood park paths or residential lanes instead of walking beside Ring Road.',
      estimatedMinutes: 'Route tweak',
    },
  ];

  const indoor: PlanRecommendation[] = [
    {
      id: 'ind-wet-mop',
      section: 'indoor',
      title: 'Damp-mop floors instead of dry broom sweeping',
      explanation: 'A dry jhadu kicks settled winter soot back up to breathing height for hours.',
      benefit: 'Traps dust cleanly—especially important where kids play',
      impact: 'High',
      howTo: 'Run a lightly damp microfiber mop once in the morning and wipe window sills with a wet cloth.',
      estimatedMinutes: '10 min clean',
    },
    {
      id: 'ind-cross-vent',
      section: 'indoor',
      title: isHighAqi
        ? 'Crack windows briefly at 2:00 PM, close before 5:00 PM'
        : 'Cross-ventilate rooms for 25 minutes mid-afternoon',
      explanation: 'Refreshes stale indoor CO2 during the cleanest hour without trapping evening haze.',
      benefit: 'Clears stuffy air without inviting night smog indoors',
      impact: 'Medium',
      howTo: 'Open opposite windows for 15–20 minutes after lunch, then draw curtains before sunset.',
      estimatedMinutes: 'Afternoon airing',
    },
    {
      id: 'ind-kitchen-hood',
      section: 'indoor',
      title: 'Switch on kitchen chimney & cover pans during tadka',
      explanation: 'High-heat tempering creates indoor PM2.5 spikes that linger in closed winter kitchens.',
      benefit: 'Prevents cooking smoke from spreading to bedrooms',
      impact: 'High',
      howTo: 'Turn on the exhaust fan 2 minutes before heating oil and keep bedroom doors shut while frying.',
      estimatedMinutes: 'Every meal',
    },
  ];

  return [...sustainable, ...routines, ...indoor];
}

export interface SeasonalTheme {
  id: 'all' | 'winter-smog' | 'cold-snap' | 'dry-dust' | 'traffic-haze';
  label: string;
  description: string;
}

export const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: 'all',
    label: 'Fresh Daily Picks',
    description: 'Mixed everyday swaps tailored to Delhi’s conditions today.',
  },
  {
    id: 'winter-smog',
    label: 'Winter Inversion',
    description: 'Focused on heavy haze, leaf smoke, and afternoon airing.',
  },
  {
    id: 'cold-snap',
    label: 'Cold Snap & Indoor',
    description: 'Smoke-free warmth, kitchen exhaust, and bedroom dust control.',
  },
  {
    id: 'traffic-haze',
    label: 'Commute & NO2',
    description: 'Metro feeders, helmet seals, and inner-lane walking routes.',
  },
  {
    id: 'dry-dust',
    label: 'Dry Wind & Dust',
    description: 'Wet-mopping, laundry drying, and settling coarse winter grit.',
  },
];

export const EXPLORE_CARDS: ExploreCard[] = [
  {
    id: 'exp-sus-1',
    category: 'sustainable',
    kicker: 'Commute',
    seasonTag: 'traffic-haze',
    title: 'Metro + Shared E-Rickshaw Loop',
    summary: 'Skip idling diesel traffic by pairing the Metro with quiet electric feeders for the last mile.',
    benefit: 'Avoids peak tailpipe fumes on main corridors',
    impact: 'High',
    swapFrom: 'Solo petrol cab stuck at signals',
    swapTo: 'Delhi Metro + electric feeder',
    steps: [
      'Use shaded residential lanes to reach the station rather than main highway footpaths.',
      'Keep a Metro smart card topped up so you aren’t waiting near busy ticket plazas.',
      'Share an e-rickshaw for the final 1.5 km through inner colony roads.',
    ],
  },
  {
    id: 'exp-sus-2',
    category: 'sustainable',
    kicker: 'Home Warmth',
    seasonTag: 'cold-snap',
    title: 'Heat Rooms Without Smoke or Dry Coils',
    summary: 'Exposed heating coils and daily incense spike indoor particulates faster than outdoor haze.',
    benefit: 'Keeps indoor PM2.5 clean while saving electricity',
    impact: 'High',
    swapFrom: 'Agarbatti, mosquito coils & exposed rod heaters',
    swapTo: 'Draft-sealed doors, wool layers & oil-filled radiator',
    steps: [
      'Tuck rolled cotton bolsters along balcony door gaps after 5 PM.',
      'Use an oil-filled radiator on low thermostat instead of glowing filament coils.',
      'Replace daily dhoop or room sprays with fresh ventilation at 2 PM.',
    ],
  },
  {
    id: 'exp-sus-3',
    category: 'sustainable',
    kicker: 'Mask Care',
    seasonTag: 'winter-smog',
    title: 'Rotate Two Reusable FFP2/N95 Masks',
    summary: 'Cloth masks let fine PM2.5 straight through; rotating two fitted FFP2 masks lasts weeks cleanly.',
    benefit: 'Real filtration without throwing away masks daily',
    impact: 'Medium',
    swapFrom: 'Loose cloth mask or daily disposables',
    swapTo: '2 rotated snug FFP2/N95 masks',
    steps: [
      'Press the nose clip firmly so air doesn’t leak around your cheeks.',
      'Alternate Mask A and Mask B every day so moisture dries out naturally.',
      'Store in a breathable cloth pouch—avoid washing FFP2 filter layers with soap.',
    ],
  },
  {
    id: 'exp-sus-4',
    category: 'sustainable',
    kicker: 'Neighborhood',
    seasonTag: 'traffic-haze',
    title: 'Office & School Carpool Rotation',
    summary: 'Splitting winter school runs or office rides between 2–3 nearby families halves tailpipe trips.',
    benefit: 'Fewer cold-start engines outside school gates',
    impact: 'High',
    swapFrom: 'Three separate morning cars idling outside gates',
    swapTo: 'One shared carpool rotation on WhatsApp',
    steps: [
      'Coordinate pickup spots 100 meters away from narrow school gates so cars don’t idle.',
      'Switch engines off whenever waiting longer than 30 seconds.',
      'Keep cabin air set to recirculate when passing congested chowks.',
    ],
  },
  {
    id: 'exp-sus-5',
    category: 'sustainable',
    kicker: 'Waste & Leaves',
    seasonTag: 'winter-smog',
    title: 'Keep Dry Colony Leaves Out of Bonfires',
    summary: 'Small evening leaf piles produce dense smoke at ground level—compost or bag them for MCD pickup.',
    benefit: 'Stops intense localized smoke right outside ground-floor flats',
    impact: 'High',
    swapFrom: 'Burning swept garden leaves at dusk',
    swapTo: 'Bagging dry leaves for colony compost pits',
    steps: [
      'Ask your RWA guard or gardener to pile dry leaves in a corner mesh bin rather than burning.',
      'Report active evening rubbish burning via the Green Delhi app.',
      'Water dusty unpaved patches near apartment gates lightly in the morning.',
    ],
  },
  {
    id: 'exp-sus-6',
    category: 'sustainable',
    kicker: 'Errands',
    seasonTag: 'dry-dust',
    title: 'Batch Local Market Trips by Cycle or Walk',
    summary: 'Combining milk, pharmacy, and sabzi runs into one midday trip cuts cold-start vehicle exhaust.',
    benefit: 'Eliminates multiple short high-emission trips',
    impact: 'Medium',
    swapFrom: 'Three short scooter/car runs across the day',
    swapTo: 'One combined afternoon walk with a cloth tote',
    steps: [
      'Keep a running kitchen list so errands happen in a single 2 PM outing.',
      'Walk or cycle through quiet park-side colony lanes rather than market frontages.',
      'Carry a foldable tote to skip thin plastic carry bags.',
    ],
  },
  {
    id: 'exp-rou-1',
    category: 'routines',
    kicker: 'Timing',
    seasonTag: 'winter-smog',
    title: 'Use the 1–4 PM Sunlight Window',
    summary: 'Morning fog and evening chill pin pollution near the ground; midday sun breaks it up.',
    benefit: 'Noticeably lighter breathing for outdoor chores',
    impact: 'High',
    steps: [
      'Keep intense morning jogs indoors when AQI crosses 200.',
      'Batch grocery errands, bank visits, or dog walks between 1:00 PM and 4:00 PM.',
      'Head back inside before dusk when temperatures drop quickly.',
    ],
  },
  {
    id: 'exp-rou-2',
    category: 'routines',
    kicker: 'Reset',
    seasonTag: 'dry-dust',
    title: 'Leave Street Dust at the Front Door',
    summary: 'Soot rides home on shoes and winter jackets and settles onto couches and bedding.',
    benefit: 'Keeps bedroom air cleaner overnight',
    impact: 'Medium',
    steps: [
      'Keep outdoor footwear on a washable mat right inside the entryway.',
      'Hang outer coats near the entrance instead of tossing them on the bed.',
      'Rinse your face and eyes with plain water after dusty commutes.',
    ],
  },
  {
    id: 'exp-rou-3',
    category: 'routines',
    kicker: 'Two-Wheeler',
    seasonTag: 'traffic-haze',
    title: 'Full-Face Visor + Mask Seal on Scooters',
    summary: 'Open helmets push exhaust straight into your nose and eyes at traffic stops.',
    benefit: 'Protects eyes from winter grit and cuts direct exhaust',
    impact: 'High',
    steps: [
      'Wear a fitted FFP2 mask underneath a closed helmet visor.',
      'Keep a small bottle of plain saline eye drops in your scooter boot for windy days.',
      'Choose inner service lanes instead of trailing behind heavy diesel trucks.',
    ],
  },
  {
    id: 'exp-rou-4',
    category: 'routines',
    kicker: 'Kids & School',
    seasonTag: 'winter-smog',
    title: 'Back-Pocket Mask & Hydration for Bus Stops',
    summary: 'Early 7 AM school bus waits hit Delhi’s thickest morning inversion layer.',
    benefit: 'Shields kids during the highest morning PM2.5 hour',
    impact: 'High',
    steps: [
      'Keep a child-sized snug FFP2 mask clipped to the school bag strap.',
      'Wait a few paces back from idling school buses until boarding.',
      'Pack warm water in an insulated flask to soothe dry morning throats.',
    ],
  },
  {
    id: 'exp-rou-5',
    category: 'routines',
    kicker: 'Routes',
    seasonTag: 'traffic-haze',
    title: 'Step 100m Off Ring Roads on Foot',
    summary: 'Pollutant concentration drops rapidly just one block inside residential colony parks.',
    benefit: 'Same walk distance with much cleaner air',
    impact: 'Medium',
    steps: [
      'Cut through colony parks or DDA inner paths when walking to the Metro.',
      'Cross intersections quickly rather than standing on signal islands.',
      'Save brisk outdoor workouts for afternoons or indoor yoga/stretching.',
    ],
  },
  {
    id: 'exp-rou-6',
    category: 'routines',
    kicker: 'Laundry',
    seasonTag: 'dry-dust',
    title: 'Bring Balcony Laundry In Before 5 PM',
    summary: 'Damp clothes left out past dusk pick up smoky evening odor and fine soot.',
    benefit: 'Cleaner sheets and towels with zero smoky smell',
    impact: 'Medium',
    steps: [
      'Hang washed clothes out by 10 AM so midday sun dries them quickly.',
      'Fold and bring laundry indoors before 4:30 PM when evening haze settles.',
      'Avoid shaking dusty rugs indoors—tap them out outdoors in afternoon sun.',
    ],
  },
  {
    id: 'exp-ind-1',
    category: 'indoor',
    kicker: 'Dust Control',
    seasonTag: 'dry-dust',
    title: 'Damp Mop Instead of Dry Sweeping',
    summary: 'Dry sweeping launches settled fine particles back into the room for hours.',
    benefit: 'Stops floor dust from circulating at child height',
    impact: 'High',
    steps: [
      'Use a damp microfiber mop each morning instead of a dry grass broom.',
      'Wipe window sills and fan blades weekly with a moist cloth.',
      'Wash heavy living-room curtains every couple of weeks in winter.',
    ],
  },
  {
    id: 'exp-ind-2',
    category: 'indoor',
    kicker: 'Plants & Reality',
    seasonTag: 'winter-smog',
    title: 'What Indoor Plants Actually Do (and Don’t)',
    summary: 'Areca palms and snake plants catch coarse dust and add humidity, though they won’t filter severe smog alone.',
    benefit: 'Nice indoor greenery—pair with sealed drafts on Very Poor days',
    impact: 'Low',
    steps: [
      'Wipe wide plant leaves with a damp cloth weekly so dust doesn’t coat them.',
      'Place Snake Plants in bedrooms and Areca Palms near bright windows.',
      'On AQI 250+ days, still rely on closed drafts, wet-mopping, or a HEPA purifier.',
    ],
  },
  {
    id: 'exp-ind-3',
    category: 'indoor',
    kicker: 'Kitchen',
    seasonTag: 'cold-snap',
    title: 'Contain Tadka & Frying Smoke Fast',
    summary: 'Cooking oil fumes create indoor PM2.5 spikes higher than street haze in closed winter kitchens.',
    benefit: 'Keeps cooking smoke from drifting into bedrooms',
    impact: 'High',
    steps: [
      'Turn on the chimney or exhaust fan 2 minutes before heating the pan.',
      'Keep the kitchen door shut or cracked toward a balcony window while frying.',
      'Cover boiling pots with lids so steam and grease stay contained.',
    ],
  },
  {
    id: 'exp-ind-4',
    category: 'indoor',
    kicker: 'Sealing',
    seasonTag: 'cold-snap',
    title: 'Stop Balcony Door Drafts at Dusk',
    summary: 'Thin gaps under sliding balcony doors let cold evening smog seep straight into bedrooms.',
    benefit: 'Keeps rooms warmer and blocks evening haze spikes',
    impact: 'High',
    steps: [
      'Press self-adhesive foam tape along noisy wooden or aluminum window frames.',
      'Lay a rolled cotton bolster along the bottom track of balcony doors at 5 PM.',
      'Use heavy winter curtains as an extra thermal and dust barrier overnight.',
    ],
  },
  {
    id: 'exp-ind-5',
    category: 'indoor',
    kicker: 'Bedroom',
    seasonTag: 'cold-snap',
    title: 'Swap Bedside Clutter & Wash Pillowcases Weekly',
    summary: 'Fabrics and open shelves trap fine winter soot right next to where you breathe for 8 hours.',
    benefit: 'Noticeably less morning congestion and dry throat',
    impact: 'Medium',
    steps: [
      'Shake out blankets onto the balcony in the afternoon sun—never indoors.',
      'Change pillowcases weekly during November–January peak haze.',
      'Run a HEPA purifier (if you own one) in the closed bedroom 1 hour before sleep.',
    ],
  },
  {
    id: 'exp-ind-6',
    category: 'indoor',
    kicker: 'Cleaning',
    seasonTag: 'dry-dust',
    title: 'Skip Aerosol Sprays & Scented Candles Indoors',
    summary: 'Room fresheners and paraffin candles release VOCs and fine soot in poorly ventilated winter rooms.',
    benefit: 'Cleaner indoor air without chemical irritation',
    impact: 'Medium',
    steps: [
      'Use baking soda bowls near damp corners instead of aerosol sprays.',
      'Air bathrooms via exhaust fans rather than synthetic deodorizers.',
      'Let 2 PM cross-ventilation clear stale indoor odors naturally.',
    ],
  },
];

// Deterministic PRNG (Mulberry32) so daily seed + visit seed gives smooth, varied picks
function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSuggestedSeasonTheme(
  airQuality: AirQualityData | null,
  date: Date = new Date()
): SeasonalTheme['id'] {
  const month = date.getMonth(); // 0-indexed
  const aqi = airQuality?.aqi ?? 248;
  const no2 = airQuality?.no2 ?? 46;

  if (no2 >= 60) return 'traffic-haze';
  if (month === 11 || month === 0) {
    return aqi >= 260 ? 'winter-smog' : 'cold-snap';
  }
  if (month === 1 || month === 2) return 'dry-dust';
  return 'winter-smog';
}

export function generateFreshExplorePicks(
  cards: ExploreCard[],
  options: {
    profile: OnboardingProfile;
    airQuality: AirQualityData | null;
    mood?: CheckInMood | null;
    seasonTheme: SeasonalTheme['id'];
    visitSeed: number;
  }
): {
  freshDailyPicks: ExploreCard[];
  orderedCards: ExploreCard[];
} {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dateHash = todayStr
    .split('')
    .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
  const rng = createSeededRandom(dateHash + options.visitSeed * 97);

  const aqi = options.airQuality?.aqi ?? 248;
  const isCommuter =
    options.profile.routine === 'Commuting around the city.' ||
    options.profile.routine === 'A mix of everything.';
  const hasKids =
    options.profile.household === 'Children.' ||
    options.profile.household === 'My whole household.';

  const scoreCard = (card: ExploreCard): number => {
    let score = card.impact === 'High' ? 3 : card.impact === 'Medium' ? 2 : 1;
    if (options.seasonTheme !== 'all' && card.seasonTag === options.seasonTheme) {
      score += 5;
    }
    if (options.mood === 'throat' && (card.category === 'indoor' || card.kicker === 'Mask Care')) {
      score += 3;
    }
    if (options.mood === 'tired' && (card.kicker === 'Timing' || card.kicker === 'Bedroom' || card.kicker === 'Sealing')) {
      score += 3;
    }
    if (isCommuter && (card.kicker === 'Commute' || card.kicker === 'Two-Wheeler' || card.kicker === 'Routes')) {
      score += 2;
    }
    if (hasKids && (card.kicker === 'Kids & School' || card.kicker === 'Dust Control' || card.kicker === 'Kitchen')) {
      score += 2;
    }
    if (aqi >= 250 && card.impact === 'High') {
      score += 1.5;
    }
    // Add seeded random jitter so every visit surfaces a fresh arrangement
    return score + rng() * 4.5;
  };

  const orderedCards = [...cards].sort((a, b) => scoreCard(b) - scoreCard(a));

  // Build a balanced 3-card "Fresh Daily Picks" spotlight (1 from each category)
  const topSustainable = orderedCards.find((c) => c.category === 'sustainable');
  const topRoutine = orderedCards.find((c) => c.category === 'routines');
  const topIndoor = orderedCards.find((c) => c.category === 'indoor');
  const freshDailyPicks = [topSustainable, topRoutine, topIndoor].filter(
    (c): c is ExploreCard => Boolean(c)
  );

  return { freshDailyPicks, orderedCards };
}

export const ASK_STARTER_QUESTIONS = [
  'Is it safe to go for a walk or run outdoors right now?',
  'Do indoor plants actually clean smog, or what works better?',
  'Which reusable N95 mask seals well for daily Metro commutes?',
  'How do I keep my flat warm without smoky coils or incense?',
];
