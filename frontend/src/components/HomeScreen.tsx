import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  MapPin,
  Navigation,
  Search,
  Share2,
  Sun,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  AirQualityData,
  OnboardingProfile,
  TabId,
  ZoneOption,
} from '../types/ventura';
import { DELHI_ZONES_LIST, getTimeOfDaySummary } from '../data/venturaContent';
import { VenturaLogo } from './VenturaLogo';
import { HeroAqiCard } from './AirQualityIllustration';
import { DetailSheet } from './DetailSheet';

interface HomeScreenProps {
  airQuality: AirQualityData | null;
  loadingAqi: boolean;
  selectedZone: ZoneOption;
  onSelectZone: (zone: ZoneOption) => void;
  onRefreshAqi: () => void;
  profile: OnboardingProfile;
  onShareAirNote: () => void;
  onStartOnboarding: () => void;
  onNavigateTab: (tab: TabId, focusSection?: string) => void;
}

type HomeDetailTopic =
  | { kind: 'aqi' }
  | { kind: 'metric'; metric: 'main' | 'pm25' | 'no2' }
  | { kind: 'pillar'; pillarId: 'sustainable' | 'routines' | 'indoor' | 'impact' }
  | null;

function getGreeting(zoneName: string): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const place = (zoneName || '').split(',')[0].replace(' (Connaught Place)', '').trim();
  return `${time}, ${place || 'Ventura'}`;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  airQuality,
  loadingAqi,
  selectedZone,
  onSelectZone,
  onRefreshAqi,
  profile,
  onShareAirNote,
  onStartOnboarding,
  onNavigateTab,
}) => {
  const [zonePickerOpen, setZonePickerOpen] = useState(false);
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneResults, setZoneResults] = useState<ZoneOption[]>(DELHI_ZONES_LIST);
  const [searchingZones, setSearchingZones] = useState(false);
  const [locating, setLocating] = useState(false);
  const [detailTopic, setDetailTopic] = useState<HomeDetailTopic>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Location services are not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(3));
        const lon = Number(pos.coords.longitude.toFixed(3));
        const gpsZone: ZoneOption = {
          id: `gps-${lat}-${lon}`,
          name: 'Current Location',
          lat,
          lon,
        };
        onSelectZone(gpsZone);
        setZonePickerOpen(false);
        setZoneQuery('');
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation failed:', err);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!zonePickerOpen) return;
    const trimmed = zoneQuery.trim();
    if (!trimmed) {
      setZoneResults(DELHI_ZONES_LIST);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingZones(true);
      try {
        const res = await fetch(`/api/zones/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            setZoneResults(data.results);
          }
        }
      } catch {
        setZoneResults(
          DELHI_ZONES_LIST.filter((z) =>
            z.name.toLowerCase().includes(trimmed.toLowerCase())
          )
        );
      } finally {
        setSearchingZones(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [zoneQuery, zonePickerOpen]);

  const pillars = [
    {
      id: 'sustainable' as const,
      title: 'Sustainable alternatives',
      cue: 'Cleaner swaps',
      Icon: Leaf,
      iconBg: 'bg-[#3D6048] text-[#FBF8F1]',
      targetTab: 'plan' as TabId,
      detailHeadline: 'Low-emission swaps that actually reduce exposure',
      detailBody:
        'Pairing Delhi Metro with e-rickshaw feeders, wearing a properly sealed FFP2/N95 mask, and dropping indoor incense or rod heaters removes major smoke sources without pricey gadgets.',
      quickTips: [
        'Use inner colony lanes on EV feeders instead of waiting beside main signals.',
        'Rotate two reusable FFP2 masks so moisture dries cleanly between days.',
        'Seal balcony door drafts and skip agarbatti or mosquito coils indoors.',
      ],
    },
    {
      id: 'routines' as const,
      title: 'Daily routines',
      cue: 'Best outdoor hours',
      Icon: Sun,
      iconBg: 'bg-[#E8C879]/65 text-[#343A32]',
      targetTab: 'plan' as TabId,
      detailHeadline: 'Plan errands around Delhi’s afternoon clearing',
      detailBody:
        'Winter air stays heaviest at dawn and after sunset. Moving walks and market runs into the 1–4 PM warmth window lowers how much fine particulate you inhale.',
      quickTips: [
        'Keep intense morning jogs indoors when AQI crosses 200.',
        'Batch errands or park time between 1:00 PM and 4:00 PM.',
        'Wash face and change outer jackets right after dusty commutes.',
      ],
    },
    {
      id: 'indoor' as const,
      title: 'Indoor air hacks',
      cue: 'Fresher rooms',
      Icon: Wind,
      iconBg: 'bg-[#A8B99A]/55 text-[#3D6048]',
      targetTab: 'explore' as TabId,
      detailHeadline: 'Keep indoor rooms calmer without kicking up dust',
      detailBody:
        'Dry jhadu sweeping and high-heat tadka without an exhaust fan spike indoor PM2.5 quickly. Simple damp cleaning and timed airing make an immediate difference.',
      quickTips: [
        'Wet-mop floors in the morning instead of dry sweeping.',
        'Turn on the kitchen chimney 2 minutes before heating oil.',
        'Open opposite windows for 15–20 minutes at 2 PM, then latch before dusk.',
      ],
    },
    {
      id: 'impact' as const,
      title: 'Impact of actions',
      cue: 'Habits logged',
      Icon: TrendingUp,
      iconBg: 'bg-[#D98C68]/35 text-[#B5633E]',
      targetTab: 'plan' as TabId,
      detailHeadline: 'Track real daily habits without guesswork',
      detailBody:
        'Consistent everyday choices—like switching off smoky indoor coils and shifting walks to midday—protect sensitive lungs day after day.',
      quickTips: [
        'Check off habits in My Plan as you complete them.',
        'Hide suggestions that don’t fit your home with "Not for me".',
        'Ask Ventura whenever you need a realistic swap for your area.',
      ],
    },
  ];

  const activePillar =
    detailTopic?.kind === 'pillar'
      ? pillars.find((p) => p.id === detailTopic.pillarId) ?? null
      : null;

  const aqiValue = airQuality?.aqi ?? 248;
  const timeSummary = getTimeOfDaySummary(aqiValue);
  const shortZoneLabel = selectedZone.name.split(',')[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between gap-2 pt-1">
        <VenturaLogo size="md" />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onShareAirNote}
            aria-label="Share today's air note"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 flex items-center justify-center text-[#3D6048] hover:bg-[#FBF8F1]/80 active:scale-95 transition-all shrink-0"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setZonePickerOpen((prev) => !prev)}
            aria-expanded={zonePickerOpen}
            className="min-h-[44px] px-3 py-2 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 flex items-center gap-1.5 text-xs font-semibold text-[#343A32] hover:bg-[#FBF8F1]/80 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3D6048] shrink-0" aria-hidden="true" />
            <span className="max-w-[115px] truncate">{shortZoneLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#343A32]/60 transition-transform duration-150 ${
                zonePickerOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      {/* Expandable Locality / City Search & GPS Picker */}
      {zonePickerOpen && (
        <section
          aria-label="Choose city or locality"
          className="rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 p-3.5 shadow-sm space-y-2.5"
        >
          <div className="flex items-center gap-2 rounded-xl bg-[#F6F0E5] px-3 py-2">
            <Search className="w-4 h-4 text-[#343A32]/50 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={zoneQuery}
              onChange={(e) => setZoneQuery(e.target.value)}
              placeholder="Search any city or area (e.g. Mumbai, Bengaluru, Connaught Place)..."
              aria-label="Search city or locality"
              className="w-full bg-transparent text-xs text-[#343A32] placeholder:text-[#343A32]/45 focus:outline-none"
            />
          </div>

          {/* Quick GPS Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="w-full min-h-[38px] px-3 py-2 rounded-xl bg-[#3D6048]/10 text-[#3D6048] hover:bg-[#3D6048]/20 active:scale-[0.99] flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{locating ? 'Detecting current GPS coordinates...' : 'Use my current location'}</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto no-scrollbar">
            {searchingZones ? (
              <p className="text-xs text-[#343A32]/60 px-2 py-2">
                Searching worldwide cities...
              </p>
            ) : zoneResults.length > 0 ? (
              zoneResults.map((zone) => {
                const active = zone.id === selectedZone.id;
                const [primary, secondary] = zone.name.split(',');
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => {
                      onSelectZone(zone);
                      setZonePickerOpen(false);
                      setZoneQuery('');
                    }}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors ${
                      active
                        ? 'bg-[#3D6048] text-[#FBF8F1]'
                        : 'hover:bg-[#F6F0E5] text-[#343A32]'
                    }`}
                  >
                    <span className="text-sm font-semibold truncate">{primary}</span>
                    {secondary && (
                      <span
                        className={`text-xs truncate shrink-0 ${
                          active ? 'text-[#FBF8F1]/80' : 'text-[#343A32]/60'
                        }`}
                      >
                        {secondary.trim()}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-[#343A32]/60 px-2 py-2">
                No matching city or locality found. Try another name.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Greeting & Hero Headline */}
      <section className="space-y-1">
        <p className="text-sm font-semibold text-[#3D6048]">{getGreeting(selectedZone.name)}</p>
        <h1 className="text-[30px] sm:text-[34px] font-extrabold leading-[1.12] tracking-tight text-[#343A32]">
          A little better, every breath.
        </h1>
        <p className="text-sm text-[#343A32]/70">
          Your air. Your day. Your next move.
        </p>
      </section>

      {/* Streamlined Dynamic Hero AQI Card with Time-Aware Forecast */}
      <HeroAqiCard
        airQuality={airQuality}
        loadingAqi={loadingAqi}
        onRefreshAqi={onRefreshAqi}
        onInspectAqi={() => setDetailTopic({ kind: 'aqi' })}
        onInspectMetric={(metric) => setDetailTopic({ kind: 'metric', metric })}
      />

      {/* Slim "Build my personal plan" Card */}
      <section className="relative overflow-hidden rounded-3xl bg-[#3D6048] text-[#FBF8F1] p-5 shadow-sm">
        <svg
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
          className="absolute -right-6 -bottom-6 w-40 h-40 text-[#FBF8F1] opacity-[0.08] pointer-events-none"
        >
          <path
            d="M150 25C105 30 68 60 52 108C46 126 45 144 48 162C66 164 84 160 100 152C144 130 160 80 150 25Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold leading-snug">
              {profile.completed
                ? 'Your personal plan is ready'
                : 'Build my personal plan'}
            </h2>
            <p className="text-sm text-[#FBF8F1]/82 leading-relaxed">
              {profile.completed
                ? `Tailored for ${profile.household.replace('.', '').toLowerCase()} in ${shortZoneLabel}.`
                : 'Answer 3 quick questions for realistic daily swaps built around your day.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile.completed ? (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('plan')}
                  className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#E8C879] text-[#343A32] text-sm font-bold flex items-center gap-2 hover:bg-[#E8C879]/90 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <span>Open my plan</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onStartOnboarding}
                  className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#FBF8F1]/14 text-[#FBF8F1] text-sm font-semibold hover:bg-[#FBF8F1]/22 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  Update
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartOnboarding}
                className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#E8C879] text-[#343A32] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#E8C879]/90 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Build my personal plan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Light 2×2 Cards: Small moves for cleaner days */}
      <section className="space-y-3" aria-label="Small moves for cleaner days">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-[#343A32]">
            Small moves for cleaner days
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('explore')}
            className="min-h-[44px] px-2 text-xs font-bold text-[#3D6048] hover:underline whitespace-nowrap"
          >
            Explore all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {pillars.map(({ id, title, cue, Icon, iconBg }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDetailTopic({ kind: 'pillar', pillarId: id })}
              className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 text-left flex flex-col justify-between gap-3.5 hover:border-[#3D6048]/35 active:scale-[0.98] transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#343A32] leading-snug">
                  {title}
                </p>
                <p className="text-xs text-[#343A32]/65 mt-0.5">{cue}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Slide-Up Detail Sheet for AQI / Metrics / Pillars */}
      <DetailSheet
        open={detailTopic !== null}
        onClose={() => setDetailTopic(null)}
        subtitle={
          detailTopic?.kind === 'aqi'
            ? `${timeSummary.badge} · ${airQuality?.zoneName ?? 'Delhi'}`
            : detailTopic?.kind === 'metric'
              ? 'Pollutant reading explained'
              : activePillar
                ? 'Everyday guidance'
                : undefined
        }
        title={
          detailTopic?.kind === 'aqi'
            ? `${airQuality?.aqi ?? 248} US AQI · ${airQuality?.status ?? 'Very Poor'}`
            : detailTopic?.kind === 'metric'
              ? detailTopic.metric === 'pm25'
                ? `PM2.5: ${airQuality?.pm25 ?? 174} µg/m³`
                : detailTopic.metric === 'no2'
                  ? `NO2: ${airQuality?.no2 ?? 46} µg/m³`
                  : `Main pollutant: ${airQuality?.mainPollutant ?? 'PM2.5'}`
              : activePillar?.title ?? ''
        }
        footer={
          detailTopic?.kind === 'pillar' && activePillar ? (
            <button
              type="button"
              onClick={() => {
                const target = activePillar.targetTab;
                const pillarId = activePillar.id;
                setDetailTopic(null);
                onNavigateTab(target, pillarId);
              }}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#3D6048] text-[#FBF8F1] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3D6048]/95 active:scale-[0.98] transition-all"
            >
              <span>
                Open {activePillar.targetTab === 'explore' ? 'in Explore' : 'in My Plan'}
              </span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onShareAirNote}
                className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#F6F0E5] text-xs font-bold text-[#3D6048] flex items-center gap-1.5 hover:bg-[#A8B99A]/25 transition-colors shrink-0"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDetailTopic(null);
                  onNavigateTab('plan');
                }}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-2xl bg-[#3D6048] text-[#FBF8F1] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3D6048]/95 active:scale-[0.98] transition-all"
              >
                <span>See today’s action plan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )
        }
      >
        {detailTopic?.kind === 'aqi' && airQuality && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1">
              <p className="text-xs font-bold text-[#3D6048]">
                {timeSummary.badge}
              </p>
              <p className="text-sm font-bold text-[#343A32]">
                {timeSummary.headline}
              </p>
              <p className="text-sm text-[#343A32]/85 leading-relaxed">
                {timeSummary.guidance}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[#D98C68]/20 p-3">
                <p className="text-[11px] font-bold text-[#343A32]/75">Morning</p>
                <p className="text-xs font-extrabold text-[#343A32] mt-0.5 tabular-nums">
                  6–11 AM
                </p>
                <p className="text-[11px] text-[#343A32]/70 mt-0.5">
                  {aqiValue >= 200 ? 'Heavy haze' : 'Cool haze'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#E8C879]/55 p-3">
                <p className="text-[11px] font-bold text-[#343A32]">Best window</p>
                <p className="text-xs font-extrabold text-[#343A32] mt-0.5 tabular-nums">
                  1–4 PM
                </p>
                <p className="text-[11px] text-[#343A32]/80 mt-0.5">
                  Lighter air
                </p>
              </div>
              <div className="rounded-2xl bg-[#F6F0E5] p-3">
                <p className="text-[11px] font-bold text-[#343A32]/75">Evening</p>
                <p className="text-xs font-extrabold text-[#343A32] mt-0.5 tabular-nums">
                  5–10 PM
                </p>
                <p className="text-[11px] text-[#343A32]/70 mt-0.5">
                  Stay indoors
                </p>
              </div>
            </div>

            {airQuality.hourlyForecast?.length > 0 && (
              <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-3">
                <p className="text-xs font-bold text-[#343A32]">
                  Hourly AQI pattern today
                </p>
                <div className="flex items-end justify-between gap-2">
                  {airQuality.hourlyForecast.slice(0, 6).map((slot) => {
                    const heightPct = Math.min(
                      100,
                      Math.max(24, Math.round((slot.aqi / 380) * 100))
                    );
                    return (
                      <div
                        key={slot.hour}
                        className="flex-1 flex flex-col items-center gap-1.5"
                      >
                        <span className="text-xs font-bold text-[#343A32] tabular-nums">
                          {slot.aqi}
                        </span>
                        <div className="w-full h-16 bg-[#FBF8F1] rounded-xl flex items-end p-1">
                          <div
                            className="w-full rounded-lg"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor:
                                slot.aqi > 250
                                  ? '#D98C68'
                                  : slot.aqi > 150
                                    ? '#E8C879'
                                    : '#3D6048',
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-[#343A32]/65 tabular-nums">
                          {slot.hour}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {detailTopic?.kind === 'metric' && airQuality && (
          <div className="space-y-3.5">
            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1.5">
              <p className="text-xs font-bold text-[#3D6048]">What it is</p>
              <p className="text-sm text-[#343A32]/85 leading-relaxed">
                {detailTopic.metric === 'no2'
                  ? 'Nitrogen dioxide (NO2) comes mostly from vehicle tailpipes and idling traffic along busy Delhi junctions.'
                  : 'PM2.5 are tiny particles under 2.5 microns from traffic, winter burning, and dust that stay trapped near street level.'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1.5">
              <p className="text-xs font-bold text-[#3D6048]">What helps most today</p>
              <p className="text-sm text-[#343A32]/85 leading-relaxed">
                {detailTopic.metric === 'no2'
                  ? 'Step one street inside away from main arterial roads, and swap short cab rides for Metro + e-rickshaw feeders.'
                  : 'Skip dry broom sweeping and indoor incense, wear a snug FFP2/N95 outdoors, and crack windows briefly around 2 PM.'}
              </p>
            </div>
          </div>
        )}

        {detailTopic?.kind === 'pillar' && activePillar && (
          <div className="space-y-4">
            <p className="text-base font-bold text-[#343A32] leading-snug">
              {activePillar.detailHeadline}
            </p>
            <p className="text-sm text-[#343A32]/80 leading-relaxed">
              {activePillar.detailBody}
            </p>
            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#3D6048]">
                Practical ways to start today
              </p>
              <ul className="space-y-2">
                {activePillar.quickTips.map((tip) => (
                  <li
                    key={tip}
                    className="text-sm text-[#343A32]/85 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-[#3D6048] font-bold">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DetailSheet>
    </div>
  );
};
