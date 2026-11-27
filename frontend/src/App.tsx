import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AirQualityData,
  CheckInMood,
  OnboardingProfile,
  PlanRecommendation,
  TabId,
  ZoneOption,
} from './types/ventura';
import {
  buildShareNote,
  DEFAULT_PROFILE,
  DELHI_ZONES_LIST,
} from './data/venturaContent';
import { HomeScreen } from './components/HomeScreen';
import { MyPlanScreen } from './components/MyPlanScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { AskVenturaScreen } from './components/AskVenturaScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';

const STORAGE_KEY = 'ventura_delhi_state_v2';

interface PersistedState {
  selectedZone: ZoneOption;
  profile: OnboardingProfile;
  customItems: PlanRecommendation[];
  dismissedIds: string[];
  completedIds: string[];
  loggedDates: string[];
  checkIns: Record<string, CheckInMood>;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        selectedZone: parsed.selectedZone?.id
          ? parsed.selectedZone
          : DELHI_ZONES_LIST[0],
        profile: parsed.profile?.priority ? parsed.profile : DEFAULT_PROFILE,
        customItems: Array.isArray(parsed.customItems) ? parsed.customItems : [],
        dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : [],
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
        loggedDates: Array.isArray(parsed.loggedDates) ? parsed.loggedDates : [],
        checkIns: parsed.checkIns && typeof parsed.checkIns === 'object' ? parsed.checkIns : {},
      };
    }
  } catch {
    // Ignore storage read issues
  }
  return {
    selectedZone: DELHI_ZONES_LIST[0],
    profile: DEFAULT_PROFILE,
    customItems: [],
    dismissedIds: [],
    completedIds: [],
    loggedDates: [],
    checkIns: {},
  };
}

export default function App() {
  const [persisted, setPersisted] = useState<PersistedState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loadingAqi, setLoadingAqi] = useState(false);
  const [pendingAskPrompt, setPendingAskPrompt] = useState<{
    text: string;
    fast?: boolean;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const splashDismissed = useRef(false);

  // Dismiss splash after 2.2 s (animation exit takes another 0.6 s)
  useEffect(() => {
    if (splashDismissed.current) return;
    const t = setTimeout(() => {
      splashDismissed.current = true;
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage write issues
    }
  }, [persisted]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const fetchAirQuality = useCallback(
    async (zone: ZoneOption, forceRefresh = false) => {
      setLoadingAqi(true);
      try {
        const params = new URLSearchParams({ zone: zone.id });
        if (typeof zone.lat === 'number' && typeof zone.lon === 'number') {
          params.set('lat', String(zone.lat));
          params.set('lon', String(zone.lon));
          params.set('name', zone.name);
        }
        if (forceRefresh) {
          params.set('refresh', '1');
        }
        const res = await fetch(`/api/air-quality?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load air quality');
        const raw = await res.json();
        
        // Map backend schema to UI format if needed
        const data: AirQualityData = {
          zoneId: zone.id,
          zoneName: zone.name,
          aqi: raw.aqi,
          status: raw.category || raw.status || 'Very Poor',
          statusSummary: raw.statusSummary || `Dominant pollutant is ${raw.dominant_pollutant || 'PM2.5'}. Favor midday errands and keep windows sealed.`,
          level: (raw.category?.toLowerCase().replace(' ', '-') as any) || raw.level || 'very-poor',
          mainPollutant: raw.dominant_pollutant || raw.mainPollutant || 'PM2.5',
          pm25: typeof raw.pm2_5 === 'number' ? Math.round(raw.pm2_5) : (raw.pm25 || 118),
          no2: typeof raw.no2 === 'number' ? Math.round(raw.no2) : (raw.no2 || 35),
          pm10: raw.pm10 || (typeof raw.pm2_5 === 'number' ? Math.round(raw.pm2_5 * 1.5) : 180),
          updatedAt: raw.timestamp || new Date().toISOString(),
          source: raw.is_sample ? 'sample' : (raw.is_cached ? 'cached' : 'live'),
          hourlyForecast: raw.hourlyForecast || [
            { hour: '06:00', aqi: Math.max(50, raw.aqi + 20) },
            { hour: '09:00', aqi: Math.max(50, raw.aqi + 15) },
            { hour: '12:00', aqi: Math.max(50, raw.aqi - 20) },
            { hour: '15:00', aqi: Math.max(50, raw.aqi - 35) },
            { hour: '18:00', aqi: Math.max(50, raw.aqi + 10) },
            { hour: '21:00', aqi: Math.max(50, raw.aqi + 25) },
          ],
        };
        setAirQuality(data);
      } catch {
        setAirQuality((prev) =>
          prev ?? {
            zoneId: zone.id,
            zoneName: zone.name,
            aqi: 248,
            status: 'Very Poor',
            statusSummary:
              'Cool surface air is trapping fine particles near street level. Favor midday errands and keep evening windows closed.',
            level: 'very-poor',
            mainPollutant: 'PM2.5',
            pm25: 174,
            no2: 46,
            pm10: 262,
            updatedAt: new Date().toISOString(),
            source: 'sample',
            hourlyForecast: [
              { hour: '06:00', aqi: 270 },
              { hour: '09:00', aqi: 262 },
              { hour: '12:00', aqi: 220 },
              { hour: '15:00', aqi: 204 },
              { hour: '18:00', aqi: 240 },
              { hour: '21:00', aqi: 266 },
            ],
          }
        );
      } finally {
        setLoadingAqi(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchAirQuality(persisted.selectedZone);
  }, [persisted.selectedZone, fetchAirQuality]);

  const handleNavigateTab = (tab: TabId, focusSection?: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'plan' && focusSection) {
      setTimeout(() => {
        const el = document.getElementById(`plan-${focusSection}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const handleAddToPlan = (item: PlanRecommendation) => {
    setPersisted((prev) => {
      if (prev.customItems.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return {
        ...prev,
        customItems: [item, ...prev.customItems],
        dismissedIds: prev.dismissedIds.filter((id) => id !== item.id),
      };
    });
    showToast(`Added "${item.title}" to My Plan`);
  };

  const handleDismissPlanItem = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      dismissedIds: prev.dismissedIds.includes(id)
        ? prev.dismissedIds
        : [...prev.dismissedIds, id],
    }));
    showToast('Hidden from today’s plan');
  };

  const handleToggleComplete = (id: string) => {
    const today = getTodayKey();
    setPersisted((prev) => {
      const exists = prev.completedIds.includes(id);
      const nextCompleted = exists
        ? prev.completedIds.filter((c) => c !== id)
        : [...prev.completedIds, id];
      const nextLoggedDates =
        !exists && !prev.loggedDates.includes(today)
          ? [...prev.loggedDates, today]
          : prev.loggedDates;
      return {
        ...prev,
        completedIds: nextCompleted,
        loggedDates: nextLoggedDates,
      };
    });
  };

  const todayKey = getTodayKey();
  const todayMood = persisted.checkIns[todayKey] ?? null;

  const handleShareAirNote = async () => {
    const note = buildShareNote(airQuality);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Delhi Air Update · Ventura',
          text: note,
        });
        return;
      } catch {
        // Fall back to clipboard if share cancelled or unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(note);
      showToast('Copied air note—ready to paste in WhatsApp');
    } catch {
      showToast('Air note ready to share');
    }
  };

  if (onboardingOpen) {
    return (
      <OnboardingFlow
        initialProfile={persisted.profile}
        onComplete={(completedProfile) => {
          setPersisted((prev) => ({
            ...prev,
            profile: completedProfile,
          }));
          setOnboardingOpen(false);
          setActiveTab('plan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('Your personalized daily plan is ready');
        }}
        onCancel={() => setOnboardingOpen(false)}
      />
    );
  }

  const savedIds = persisted.customItems.map((i) => i.id);

  return (
    <div className="min-h-dvh bg-[#F6F0E5] text-[#343A32]">
      {/* Splash screen — shown only on first load */}
      <SplashScreen visible={showSplash} />
      {/* Main Mobile-First Viewport Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24">
        {activeTab === 'home' && (
          <HomeScreen
            airQuality={airQuality}
            loadingAqi={loadingAqi}
            selectedZone={persisted.selectedZone}
            onSelectZone={(selectedZone) =>
              setPersisted((prev) => ({ ...prev, selectedZone }))
            }
            onRefreshAqi={() => void fetchAirQuality(persisted.selectedZone, true)}
            profile={persisted.profile}
            onShareAirNote={() => void handleShareAirNote()}
            onStartOnboarding={() => setOnboardingOpen(true)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'plan' && (
          <MyPlanScreen
            airQuality={airQuality}
            profile={persisted.profile}
            todayMood={todayMood}
            customItems={persisted.customItems}
            dismissedIds={persisted.dismissedIds}
            completedIds={persisted.completedIds}
            daysActiveCount={persisted.loggedDates.length}
            onDismissItem={handleDismissPlanItem}
            onRestoreAll={() =>
              setPersisted((prev) => ({ ...prev, dismissedIds: [] }))
            }
            onToggleComplete={handleToggleComplete}
            onEditOnboarding={() => setOnboardingOpen(true)}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreScreen
            airQuality={airQuality}
            profile={persisted.profile}
            todayMood={todayMood}
            savedCardIds={savedIds}
            onAddToPlan={(item) => handleAddToPlan(item)}
            onOpenAskVentura={(prompt, fast) => {
              if (prompt) setPendingAskPrompt({ text: prompt, fast });
              handleNavigateTab('ask');
            }}
          />
        )}

        {activeTab === 'ask' && (
          <AskVenturaScreen
            airQuality={airQuality}
            profile={persisted.profile}
            savedCardIds={savedIds}
            onAddToPlan={(item) => handleAddToPlan(item)}
            pendingPrompt={pendingAskPrompt}
            onConsumePendingPrompt={() => setPendingAskPrompt(null)}
          />
        )}
      </main>

      {/* Quiet Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#343A32] text-[#FBF8F1] text-xs font-semibold shadow-md whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      {/* Persistent 4-Tab Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigateTab(tab)}
        planCount={persisted.customItems.length}
      />
    </div>
  );
}
