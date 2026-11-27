import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Leaf,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Wind,
  XCircle,
} from 'lucide-react';
import {
  AirQualityData,
  OnboardingProfile,
  PlanRecommendation,
} from '../types/ventura';
import { buildPersonalizedPlan } from '../data/venturaContent';
import { ImpactLabel } from './ImpactBadge';
import { DetailSheet } from './DetailSheet';

interface MyPlanScreenProps {
  airQuality: AirQualityData | null;
  profile: OnboardingProfile;
  todayMood: 'fine' | 'throat' | 'tired' | null;
  customItems: PlanRecommendation[];
  dismissedIds: string[];
  completedIds: string[];
  daysActiveCount: number;
  onDismissItem: (id: string) => void;
  onRestoreAll: () => void;
  onToggleComplete: (id: string) => void;
  onEditOnboarding: () => void;
}

export const MyPlanScreen: React.FC<MyPlanScreenProps> = ({
  airQuality,
  profile,
  todayMood,
  customItems,
  dismissedIds,
  completedIds,
  daysActiveCount,
  onDismissItem,
  onRestoreAll,
  onToggleComplete,
  onEditOnboarding,
}) => {
  const [selectedItem, setSelectedItem] = useState<PlanRecommendation | null>(null);

  const currentHour = new Date().getHours();
  const allRecommendations = useMemo(() => {
    const base = buildPersonalizedPlan(profile, airQuality, currentHour, todayMood);
    return [...customItems, ...base].filter((item) => !dismissedIds.includes(item.id));
  }, [profile, airQuality, currentHour, todayMood, customItems, dismissedIds]);

  const sustainableList = allRecommendations.filter((i) => i.section === 'sustainable');
  const routinesList = allRecommendations.filter((i) => i.section === 'routines');
  const indoorList = allRecommendations.filter((i) => i.section === 'indoor');

  const completedItems = allRecommendations.filter((i) =>
    completedIds.includes(i.id)
  );
  const completedCount = completedItems.length;
  const totalCount = allRecommendations.length;

  const areasAddressed: string[] = [];
  if (completedItems.some((i) => i.section === 'sustainable')) {
    areasAddressed.push('Cleaner swaps');
  }
  if (completedItems.some((i) => i.section === 'routines')) {
    areasAddressed.push('Outdoor timing');
  }
  if (completedItems.some((i) => i.section === 'indoor')) {
    areasAddressed.push('Indoor dust & smoke');
  }

  const greetingFocus = profile.completed
    ? `For ${profile.household.replace('.', '').toLowerCase()} · ${profile.routine.replace('.', '')}`
    : 'Delhi winter daily plan';

  const airExplanation = airQuality
    ? airQuality.statusSummary
    : 'Cool winter air holds fine particles near street level. Focus on smoke-free rooms and afternoon errands.';

  const renderCard = (item: PlanRecommendation, featured = false) => {
    const isCompleted = completedIds.includes(item.id);

    return (
      <article
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedItem(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedItem(item);
          }
        }}
        className={`rounded-2xl p-4 cursor-pointer transition-all duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#3D6048] ${
          featured
            ? isCompleted
              ? 'bg-[#3D6048]/80 text-[#FBF8F1]'
              : 'bg-[#3D6048] text-[#FBF8F1] shadow-sm'
            : isCompleted
              ? 'bg-[#A8B99A]/22 border border-[#3D6048]/20 text-[#343A32]'
              : 'bg-[#FBF8F1] border border-[#343A32]/10 text-[#343A32] hover:border-[#3D6048]/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <ImpactLabel impact={item.impact} lightOnDark={featured} />
            <h3
              className={`text-[15px] font-bold leading-snug ${
                isCompleted ? 'line-through opacity-75' : ''
              }`}
            >
              {item.title}
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                featured ? 'text-[#FBF8F1]/82' : 'text-[#343A32]/72'
              }`}
            >
              {item.explanation}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(item.id);
            }}
            aria-label={
              isCompleted
                ? `Mark "${item.title}" incomplete`
                : `Mark "${item.title}" done today`
            }
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-1 flex items-center justify-center rounded-xl active:scale-90 transition-transform shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2
                className={`w-6 h-6 ${featured ? 'text-[#E8C879]' : 'text-[#3D6048]'}`}
              />
            ) : (
              <Circle
                className={`w-6 h-6 ${
                  featured
                    ? 'text-[#FBF8F1]/45 hover:text-[#E8C879]'
                    : 'text-[#343A32]/28 hover:text-[#3D6048]'
                }`}
              />
            )}
          </button>
        </div>
      </article>
    );
  };

  const selectedCompleted = selectedItem
    ? completedIds.includes(selectedItem.id)
    : false;

  return (
    <div className="space-y-7 pb-8">
      {/* Header & Today's Air Summary */}
      <header className="space-y-3 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#3D6048]">
              {greetingFocus}
            </p>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#343A32] mt-0.5">
              Your daily plan
            </h1>
          </div>
          <button
            type="button"
            onClick={onEditOnboarding}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 text-xs font-bold text-[#343A32] flex items-center gap-1.5 hover:bg-[#FBF8F1]/80 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3D6048]" aria-hidden="true" />
            <span>{profile.completed ? 'Adjust' : 'Personalize'}</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#343A32]">
              {airQuality ? airQuality.zoneName : 'Delhi Air Today'}
            </span>
            {airQuality && (
              <span className="font-bold text-[#B5633E] tabular-nums">
                {airQuality.aqi} AQI · {airQuality.status}
              </span>
            )}
          </div>
          <p className="text-sm text-[#343A32]/80 leading-relaxed">
            {airExplanation}
          </p>
        </div>
      </header>

      {/* Restore dismissed items banner */}
      {dismissedIds.length > 0 && (
        <div className="rounded-2xl bg-[#E8C879]/30 px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#343A32]">
            {dismissedIds.length} {dismissedIds.length === 1 ? 'tip' : 'tips'} hidden
          </span>
          <button
            type="button"
            onClick={onRestoreAll}
            className="min-h-[40px] px-3 text-xs font-bold text-[#3D6048] flex items-center gap-1 hover:underline whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restore</span>
          </button>
        </div>
      )}

      {/* 1. Sustainable alternatives */}
      <section id="plan-sustainable" aria-label="Sustainable alternatives" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-xl bg-[#3D6048] flex items-center justify-center text-[#E8C879] shrink-0">
            <Leaf className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#343A32]">
              1. Sustainable alternatives
            </h2>
            <p className="text-xs text-[#3D6048] font-medium">
              Top priority for cleaner air
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sustainableList.length > 0 ? (
            sustainableList.map((item) => renderCard(item, true))
          ) : (
            <p className="text-sm text-[#343A32]/65 px-1">
              All sustainable alternatives hidden. Tap Restore above to bring them back.
            </p>
          )}
        </div>
      </section>

      {/* 2. Daily routines */}
      <section id="plan-routines" aria-label="Daily routines" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-xl bg-[#E8C879]/45 flex items-center justify-center text-[#343A32] shrink-0">
            <Sun className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-extrabold text-[#343A32]">
            2. Daily routines
          </h2>
        </div>

        <div className="space-y-2.5">
          {routinesList.map((item) => renderCard(item, false))}
        </div>
      </section>

      {/* 3. Indoor air hacks */}
      <section id="plan-indoor" aria-label="Indoor air hacks" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-xl bg-[#A8B99A]/45 flex items-center justify-center text-[#343A32] shrink-0">
            <Wind className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-extrabold text-[#343A32]">
            3. Indoor air hacks
          </h2>
        </div>

        <div className="space-y-2.5">
          {indoorList.map((item) => renderCard(item, false))}
        </div>
      </section>

      {/* 4. Impact of actions (honest habit tracking, no invented percentages) */}
      <section
        id="plan-impact"
        aria-label="Impact of actions"
        className="rounded-3xl bg-[#FBF8F1] border border-[#343A32]/10 p-5 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D98C68]/25 flex items-center justify-center text-[#B5633E] shrink-0">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-extrabold text-[#343A32]">
            4. Impact of actions
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F6F0E5] p-3.5">
            <p className="text-xs text-[#343A32]/65 font-medium">Done today</p>
            <p
              className="text-2xl font-extrabold text-[#3D6048] mt-1 tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {completedCount}/{totalCount}
            </p>
            <p className="text-[11px] text-[#343A32]/65 mt-0.5">
              Habits checked
            </p>
          </div>

          <div className="rounded-2xl bg-[#F6F0E5] p-3.5">
            <p className="text-xs text-[#343A32]/65 font-medium">Days logged</p>
            <p
              className="text-2xl font-extrabold text-[#B5633E] mt-1 tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {daysActiveCount}
            </p>
            <p className="text-[11px] text-[#343A32]/65 mt-0.5">
              {daysActiveCount === 1 ? 'First day tracked' : 'Active days'}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#343A32]/75 leading-relaxed">
          {areasAddressed.length > 0
            ? `Today’s focus covered: ${areasAddressed.join(' · ')}. Consistent smoke-free rooms and timed errands make the biggest real difference.`
            : 'Check off any habit above as you complete it to track what you covered today.'}
        </p>
      </section>

      {/* Detail Sheet for Tapped Plan Card */}
      <DetailSheet
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        subtitle={
          selectedItem?.section === 'sustainable'
            ? 'Sustainable alternative'
            : selectedItem?.section === 'routines'
              ? 'Daily routine'
              : 'Indoor air hack'
        }
        title={selectedItem?.title ?? ''}
        footer={
          selectedItem && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onDismissItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="min-h-[48px] px-4 py-3 rounded-2xl bg-[#F6F0E5] text-xs font-bold text-[#343A32]/75 hover:text-[#B5633E] flex items-center gap-1.5 transition-colors shrink-0"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                <span>Not for me</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleComplete(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-2xl bg-[#3D6048] text-[#FBF8F1] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3D6048]/95 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{selectedCompleted ? 'Mark not done' : 'Mark done today'}</span>
              </button>
            </div>
          )
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImpactLabel impact={selectedItem.impact} />
              {selectedItem.estimatedMinutes && (
                <>
                  <span className="text-xs text-[#343A32]/35" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-xs font-semibold text-[#343A32]/65">
                    {selectedItem.estimatedMinutes}
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-[#343A32]/85 leading-relaxed">
              {selectedItem.explanation}
            </p>

            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1.5">
              <p className="text-xs font-bold text-[#3D6048]">Practical benefit</p>
              <p className="text-sm font-medium text-[#343A32] leading-relaxed">
                {selectedItem.benefit}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1.5">
              <p className="text-xs font-bold text-[#3D6048]">How to do it today</p>
              <p className="text-sm text-[#343A32]/85 leading-relaxed">
                {selectedItem.howTo}
              </p>
            </div>
          </div>
        )}
      </DetailSheet>
    </div>
  );
};
