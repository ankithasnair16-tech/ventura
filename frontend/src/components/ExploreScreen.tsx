import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronRight,
  Leaf,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react';
import {
  AirQualityData,
  CheckInMood,
  ExploreCard,
  OnboardingProfile,
  PlanRecommendation,
} from '../types/ventura';
import {
  EXPLORE_CARDS,
  GENERATED_IMAGES,
  generateFreshExplorePicks,
  getSuggestedSeasonTheme,
} from '../data/venturaContent';
import { ImpactLabel } from './ImpactBadge';
import { DetailSheet } from './DetailSheet';

interface ExploreScreenProps {
  airQuality: AirQualityData | null;
  profile: OnboardingProfile;
  todayMood: CheckInMood | null;
  savedCardIds: string[];
  onAddToPlan: (item: PlanRecommendation, sourceCardId: string) => void;
  onOpenAskVentura: (prefillPrompt?: string, fast?: boolean) => void;
}

type CategoryFilter = 'all' | 'sustainable' | 'routines' | 'indoor';

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  airQuality,
  profile,
  todayMood,
  savedCardIds,
  onAddToPlan,
  onOpenAskVentura,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByImpact, setSortByImpact] = useState(false);
  const [visitSeed, setVisitSeed] = useState(() =>
    Math.floor(Math.random() * 100000)
  );
  const [aiPageCards, setAiPageCards] = useState<ExploreCard[] | null>(null);
  const [seenAiTitles, setSeenAiTitles] = useState<string[]>([]);
  const [loadingMoreAi, setLoadingMoreAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExploreCard | null>(null);

  const suggestedThemeId = useMemo(
    () => getSuggestedSeasonTheme(airQuality),
    [airQuality]
  );

  const baseOrderedCards = useMemo(() => {
    const generated = generateFreshExplorePicks(EXPLORE_CARDS, {
      profile,
      airQuality,
      mood: todayMood,
      seasonTheme: suggestedThemeId,
      visitSeed,
    });
    return generated.orderedCards;
  }, [profile, airQuality, todayMood, suggestedThemeId, visitSeed]);

  const orderedCards = useMemo(() => {
    if (!aiPageCards || aiPageCards.length === 0) {
      return baseOrderedCards;
    }
    const aiByCat = {
      sustainable: aiPageCards.filter((c) => c.category === 'sustainable'),
      routines: aiPageCards.filter((c) => c.category === 'routines'),
      indoor: aiPageCards.filter((c) => c.category === 'indoor'),
    };
    return [
      ...(aiByCat.sustainable.length > 0
        ? aiByCat.sustainable
        : baseOrderedCards.filter((c) => c.category === 'sustainable')),
      ...(aiByCat.routines.length > 0
        ? aiByCat.routines
        : baseOrderedCards.filter((c) => c.category === 'routines')),
      ...(aiByCat.indoor.length > 0
        ? aiByCat.indoor
        : baseOrderedCards.filter((c) => c.category === 'indoor')),
    ];
  }, [aiPageCards, baseOrderedCards]);

  const filteredCards = useMemo(() => {
    let list = orderedCards;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.kicker.toLowerCase().includes(q)
      );
    }
    if (sortByImpact) {
      const rank = { high: 3, medium: 2, low: 1 };
      list = [...list].sort((a, b) => (rank[b.impact] || 0) - (rank[a.impact] || 0));
    }
    return list;
  }, [orderedCards, searchQuery, sortByImpact]);

  const isDefaultAllView = filter === 'all' && !searchQuery.trim();

  const sustainableCards = useMemo(() => {
    const list = filteredCards.filter((c) => c.category === 'sustainable');
    return isDefaultAllView ? list.slice(0, 3) : list;
  }, [filteredCards, isDefaultAllView]);

  const routineCards = useMemo(() => {
    const list = filteredCards.filter((c) => c.category === 'routines');
    return isDefaultAllView ? list.slice(0, 3) : list;
  }, [filteredCards, isDefaultAllView]);

  const indoorCards = useMemo(() => {
    const list = filteredCards.filter((c) => c.category === 'indoor');
    return isDefaultAllView ? list.slice(0, 3) : list;
  }, [filteredCards, isDefaultAllView]);

  const handleRerollMix = () => {
    setAiPageCards(null);
    setVisitSeed((prev) => prev + Math.floor(1 + Math.random() * 997));
  };

  const handleFetchMoreWithAi = async () => {
    if (loadingMoreAi) return;
    setLoadingMoreAi(true);
    setAiError(null);
    try {
      const existingTitles = Array.from(
        new Set([...orderedCards.map((c) => c.title), ...seenAiTitles])
      );
      const res = await fetch('/api/explore-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: filter,
          existingTitles,
          profile,
          airQuality,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not load fresh ideas.');
      }
      if (Array.isArray(data.cards) && data.cards.length > 0) {
        const mapped: ExploreCard[] = data.cards.map((c: any) => ({
          id: c.id,
          category: (c.category || (filter === 'all' ? 'sustainable' : filter)) as ExploreCard['category'],
          kicker: c.kicker || c.tag || 'Clean Choice',
          title: c.title,
          summary: c.summary,
          benefit: c.benefit || c.detail || 'Reduces particulate exposure',
          impact: (c.impactLevel || c.impact || 'High') as any,
          steps: Array.isArray(c.steps) && c.steps.length > 0 ? c.steps : [c.detail || c.summary],
          swapFrom: c.swapFrom || undefined,
          swapTo: c.swapTo || undefined,
        }));

        setAiPageCards((prev) => {
          const prevCards = prev || [];
          const incomingCats = new Set(mapped.map((c) => c.category));
          const kept = prevCards.filter((c) => !incomingCats.has(c.category));
          return [...kept, ...mapped];
        });

        setSeenAiTitles((prev) => [
          ...prev,
          ...mapped.map((c) => c.title),
        ]);
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Unable to fetch fresh ideas right now.'
      );
    } finally {
      setLoadingMoreAi(false);
    }
  };

  const handleSave = (card: ExploreCard) => {
    const section =
      card.category === 'sustainable'
        ? 'sustainable'
        : card.category === 'routines'
          ? 'routines'
          : 'indoor';

    onAddToPlan(
      {
        id: `custom-${card.id}`,
        section,
        title: card.title,
        explanation: card.summary,
        benefit: card.benefit,
        impact: card.impact,
        howTo: card.steps.join(' '),
        estimatedMinutes: card.kicker,
      },
      card.id
    );
  };

  const getCategoryImage = (cat: ExploreCard['category']) => {
    if (cat === 'sustainable') return GENERATED_IMAGES.sustainableAlt;
    if (cat === 'routines') return GENERATED_IMAGES.dailyRoutines;
    return GENERATED_IMAGES.indoorAir;
  };

  const renderCleanCard = (card: ExploreCard, priority = false) => {
    const isSaved = savedCardIds.includes(`custom-${card.id}`);

    return (
      <article
        key={card.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedCard(card)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedCard(card);
          }
        }}
        className={`rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#3D6048] ${
          priority
            ? 'bg-[#FBF8F1] border border-[#3D6048]/28 shadow-sm hover:border-[#3D6048]/55'
            : 'bg-[#FBF8F1] border border-[#343A32]/10 hover:border-[#3D6048]/35'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-bold text-[#3D6048]">{card.kicker}</span>
              <span className="text-[#343A32]/30" aria-hidden="true">
                ·
              </span>
              <ImpactLabel impact={card.impact} />
              {isSaved && (
                <>
                  <span className="text-[#343A32]/30" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-semibold text-[#3D6048]">In plan</span>
                </>
              )}
            </div>

            <h3 className="text-[15px] font-bold text-[#343A32] leading-snug">
              {card.title}
            </h3>
            <p className="text-xs text-[#343A32]/75 leading-relaxed">
              {card.summary}
            </p>
          </div>

          <ChevronRight
            className="w-4 h-4 text-[#343A32]/40 mt-1 shrink-0"
            aria-hidden="true"
          />
        </div>
      </article>
    );
  };

  const selectedSaved = selectedCard
    ? savedCardIds.includes(`custom-${selectedCard.id}`)
    : false;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="space-y-3 pt-1">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#343A32]">
            Explore cleaner living
          </h1>
          <p className="text-sm text-[#343A32]/72 leading-relaxed mt-0.5">
            Rotated for today’s air—shuffle or generate fresh ideas anytime.
          </p>
        </div>

        {/* Search + Shuffle Controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/12 px-3 py-2">
            <Search className="w-4 h-4 text-[#343A32]/45 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search masks, kitchen, scooter..."
              aria-label="Search solutions"
              className="w-full bg-transparent text-xs text-[#343A32] placeholder:text-[#343A32]/45 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortByImpact((prev) => !prev)}
            aria-label="Sort solutions by impact"
            className={`min-h-[44px] px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              sortByImpact
                ? 'bg-[#3D6048] text-white border-[#3D6048] shadow-sm'
                : 'bg-[#FBF8F1] border-[#343A32]/12 text-[#343A32] hover:border-[#3D6048]/40'
            }`}
          >
            <ArrowUpDown className={`w-3.5 h-3.5 ${sortByImpact ? 'text-white' : 'text-[#3D6048]'}`} aria-hidden="true" />
            <span>{sortByImpact ? 'High Impact' : 'Sort: Impact'}</span>
          </button>
        </div>

        {/* Segmented Category Filter */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label="Explore categories"
        >
          {(
            [
              { id: 'all', label: 'All guides' },
              { id: 'sustainable', label: 'Sustainable' },
              { id: 'routines', label: 'Routines' },
              { id: 'indoor', label: 'Indoor air' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`min-h-[42px] px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#3D6048] text-[#FBF8F1] shadow-sm'
                    : 'bg-[#FBF8F1] border border-[#343A32]/10 text-[#343A32]/75 hover:text-[#343A32]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Generate Fresh AI Solutions Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleFetchMoreWithAi}
          disabled={loadingMoreAi}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#E8C879]/45 border border-[#E8C879] text-xs font-bold text-[#343A32] flex items-center justify-center gap-2 hover:bg-[#E8C879]/65 active:scale-[0.99] transition-all"
        >
          {loadingMoreAi ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Generating fresh ideas for the page...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#3D6048]" aria-hidden="true" />
              <span>Get fresh ideas for today’s air</span>
            </>
          )}
        </button>

        {aiError && (
          <p className="text-xs text-[#B5633E] font-medium px-1">{aiError}</p>
        )}
      </div>

      {/* CATEGORY 1: Sustainable alternatives */}
      {(filter === 'all' || filter === 'sustainable') && (
        <section aria-label="Sustainable alternatives" className="space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-[#3D6048] shadow-sm">
            <img
              src={GENERATED_IMAGES.sustainableAlt}
              alt="Forest green electric scooter parked beside potted plants and woven linen bag"
              referrerPolicy="no-referrer"
              className="w-full h-40 object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#243A2B]/85 via-[#243A2B]/25 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-3.5 left-4 right-4 text-[#FBF8F1]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8C879]">
                <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Priority category</span>
              </div>
              <h2 className="text-xl font-extrabold mt-0.5">
                Sustainable alternatives
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {sustainableCards.length > 0 ? (
              sustainableCards.map((card) => renderCleanCard(card, true))
            ) : (
              <p className="text-xs text-[#343A32]/65 px-1">
                No matching sustainable swaps for "{searchQuery}".
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenAskVentura(
                'Give me one realistic sustainable swap for my evening routine in Delhi today.',
                true
              )
            }
            className="w-full min-h-[46px] px-4 py-3 rounded-2xl bg-[#3D6048] text-[#FBF8F1] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#3D6048]/95 active:scale-[0.99] transition-all"
          >
            <span>Ask Ventura for a custom swap</span>
            <ArrowRight className="w-4 h-4 text-[#E8C879]" aria-hidden="true" />
          </button>
        </section>
      )}

      {/* CATEGORY 2: Cleaner everyday routines */}
      {(filter === 'all' || filter === 'routines') && (
        <section aria-label="Cleaner everyday routines" className="space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-[#E8C879]/25">
            <img
              src={GENERATED_IMAGES.dailyRoutines}
              alt="Warm herbal tulsi tea by a sunlit window with green leaves outside"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#343A32]/78 via-[#343A32]/15 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-3 left-4 right-4 text-[#FBF8F1]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8C879]">
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Timing & habits</span>
              </div>
              <h2 className="text-lg font-extrabold">
                Cleaner everyday routines
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {routineCards.length > 0 ? (
              routineCards.map((card) => renderCleanCard(card))
            ) : (
              <p className="text-xs text-[#343A32]/65 px-1">
                No matching routines for "{searchQuery}".
              </p>
            )}
          </div>
        </section>
      )}

      {/* CATEGORY 3: Indoor air improvements */}
      {(filter === 'all' || filter === 'indoor') && (
        <section aria-label="Indoor air improvements" className="space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-[#A8B99A]/30">
            <img
              src={GENERATED_IMAGES.indoorAir}
              alt="Sunlit living room corner with areca palm and snake plant in terracotta pots"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#343A32]/78 via-[#343A32]/15 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-3 left-4 right-4 text-[#FBF8F1]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#A8B99A]">
                <Wind className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Home sanctuary</span>
              </div>
              <h2 className="text-lg font-extrabold">
                Indoor air improvements
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {indoorCards.length > 0 ? (
              indoorCards.map((card) => renderCleanCard(card))
            ) : (
              <p className="text-xs text-[#343A32]/65 px-1">
                No matching indoor improvements for "{searchQuery}".
              </p>
            )}
          </div>
        </section>
      )}

      {/* Slide-Up Detail Sheet for Explore Cards */}
      <DetailSheet
        open={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        subtitle={selectedCard?.kicker}
        title={selectedCard?.title ?? ''}
        footer={
          selectedCard && (
            <button
              type="button"
              onClick={() => {
                handleSave(selectedCard);
                setSelectedCard(null);
              }}
              disabled={selectedSaved}
              className={`w-full min-h-[48px] px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                selectedSaved
                  ? 'bg-[#A8B99A]/35 text-[#3D6048] cursor-default'
                  : 'bg-[#3D6048] text-[#FBF8F1] hover:bg-[#3D6048]/95 active:scale-[0.98]'
              }`}
            >
              {selectedSaved ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Already in my daily plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add to my daily plan</span>
                </>
              )}
            </button>
          )
        }
      >
        {selectedCard && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-[#F6F0E5] h-40">
              <img
                src={getCategoryImage(selectedCard.category)}
                alt={selectedCard.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <ImpactLabel impact={selectedCard.impact} />
              <span className="text-xs font-semibold text-[#3D6048]">
                {selectedCard.benefit}
              </span>
            </div>

            <p className="text-sm text-[#343A32]/85 leading-relaxed">
              {selectedCard.summary}
            </p>

            {selectedCard.swapFrom && selectedCard.swapTo && (
              <div className="rounded-2xl bg-[#F6F0E5] p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#343A32]/65">
                  <span className="font-semibold shrink-0">Skip:</span>
                  <span className="line-through">{selectedCard.swapFrom}</span>
                </div>
                <div className="flex items-center gap-2 text-[#3D6048] font-bold">
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Try instead: {selectedCard.swapTo}</span>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#3D6048]">
                Step-by-step guide
              </p>
              <ol className="space-y-2">
                {selectedCard.steps.map((step, index) => (
                  <li
                    key={step}
                    className="text-sm text-[#343A32]/85 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#3D6048] text-[#FBF8F1] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </DetailSheet>
    </div>
  );
};
