import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Leaf,
  Plus,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react';
import {
  AirQualityData,
  ChatMessage,
  OnboardingProfile,
  PlanRecommendation,
  SustainableAssistantCard,
} from '../types/ventura';
import { ASK_STARTER_QUESTIONS } from '../data/venturaContent';
import { ImpactLabel } from './ImpactBadge';
import { DetailSheet } from './DetailSheet';

interface AskVenturaScreenProps {
  airQuality: AirQualityData | null;
  profile: OnboardingProfile;
  savedCardIds: string[];
  onAddToPlan: (item: PlanRecommendation, sourceId: string) => void;
  pendingPrompt: { text: string; fast?: boolean } | null;
  onConsumePendingPrompt: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Ask me anything about practical, low-emission ways to handle today’s air—commute routes, masks that seal well, heating without smoke, or when to air out rooms.',
  timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
};

export const AskVenturaScreen: React.FC<AskVenturaScreenProps> = ({
  airQuality,
  profile,
  savedCardIds,
  onAddToPlan,
  pendingPrompt,
  onConsumePendingPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{
    card: SustainableAssistantCard;
    key: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string, fast = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowTime,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: nowTime,
    };

    const historyPayload = [...messages, userMsg]
      .filter((m) => !m.error && m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, placeholderAssistant]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-ventura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          airQuality,
          profile,
          fast,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('text/event-stream') || !response.body) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Could not reach Ventura assistant.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const evt of events) {
          const line = evt
            .split('\n')
            .find((l) => l.startsWith('data: '));
          if (!line) continue;

          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === 'delta' && typeof payload.text === 'string') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: m.text + payload.text } : m
                )
              );
            } else if (payload.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        text: payload.reply || m.text,
                        cards: Array.isArray(payload.cards) ? payload.cards : [],
                      }
                    : m
                )
              );
            } else if (payload.type === 'error') {
              throw new Error(payload.error || 'Could not reach Ventura assistant.');
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ventura could not respond right now. Please try again.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: message, error: true } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt) {
      const { text, fast } = pendingPrompt;
      onConsumePendingPrompt();
      void sendMessage(text, Boolean(fast));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const handleClearChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const handleSaveCard = (card: SustainableAssistantCard, cardKey: string) => {
    onAddToPlan(
      {
        id: cardKey,
        section: 'sustainable',
        title: card.title,
        explanation: card.explanation,
        benefit: card.benefit,
        impact: card.impact,
        howTo: `${card.explanation} Benefit: ${card.benefit}`,
        estimatedMinutes: card.category,
      },
      cardKey
    );
  };

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user')?.text;

  const selectedSaved = selectedCard
    ? savedCardIds.includes(selectedCard.key)
    : false;

  return (
    <div className="flex flex-col h-[calc(100dvh-96px)] max-h-[820px]">
      {/* Assistant Header */}
      <header className="pt-1 pb-3 border-b border-[#343A32]/10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#3D6048] flex items-center justify-center text-[#E8C879] shrink-0 shadow-sm">
            <Leaf className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-[#343A32] leading-tight">
              Ask Ventura
            </h1>
            <p className="text-xs text-[#3D6048] font-medium truncate">
              Focused exclusively on sustainable alternatives
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearChat}
          aria-label="Clear conversation"
          className="min-h-[44px] px-3 py-2 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 text-xs font-semibold text-[#343A32]/75 hover:text-[#343A32] flex items-center gap-1.5 active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Clear</span>
        </button>
      </header>

      {/* Scrollable Chat Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isStreamingEmpty = !isUser && !msg.text && loading;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2.5`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#3D6048] text-[#FBF8F1] rounded-br-md'
                    : msg.error
                      ? 'bg-[#D98C68]/20 border border-[#D98C68]/50 text-[#343A32] rounded-bl-md'
                      : 'bg-[#FBF8F1] border border-[#343A32]/10 text-[#343A32] rounded-bl-md'
                }`}
              >
                {isStreamingEmpty ? (
                  <p className="text-xs font-medium text-[#3D6048]">
                    Checking Delhi options...
                  </p>
                ) : (
                  <p>{msg.text}</p>
                )}

                {msg.error && lastUserMessage && (
                  <button
                    type="button"
                    onClick={() => void sendMessage(lastUserMessage, true)}
                    className="mt-2 min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6048] hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Try again</span>
                  </button>
                )}
                <span
                  className={`block text-[10px] mt-1.5 ${
                    isUser ? 'text-[#FBF8F1]/65' : 'text-[#343A32]/50'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Tappable Assistant Sustainable Recommendation Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="w-full space-y-2.5 pl-1">
                  {msg.cards.map((card, idx) => {
                    const cardKey = `ai-${msg.id}-${idx}`;
                    const isSaved = savedCardIds.includes(cardKey);
                    return (
                      <div
                        key={cardKey}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCard({ card, key: cardKey })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedCard({ card, key: cardKey });
                          }
                        }}
                        className="rounded-2xl bg-[#FBF8F1] border border-[#3D6048]/20 p-3.5 shadow-sm space-y-1.5 cursor-pointer hover:border-[#3D6048]/45 active:scale-[0.99] transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#3D6048]">
                            {card.category}
                          </span>
                          <ImpactLabel impact={card.impact} />
                        </div>
                        <h3 className="text-sm font-bold text-[#343A32] flex items-center justify-between gap-2">
                          <span>{card.title}</span>
                          <ChevronRight className="w-4 h-4 text-[#343A32]/40 shrink-0" aria-hidden="true" />
                        </h3>
                        <p className="text-xs text-[#343A32]/80 leading-relaxed">
                          {card.explanation}
                        </p>
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#3D6048]">
                            {card.benefit}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveCard(card, cardKey);
                            }}
                            disabled={isSaved}
                            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
                              isSaved
                                ? 'bg-[#A8B99A]/30 text-[#3D6048]'
                                : 'bg-[#3D6048] text-[#FBF8F1] hover:bg-[#3D6048]/90 active:scale-95'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Add to plan</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Suggested Starter Questions */}
        {messages.length === 1 && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-[#343A32]/65 px-1">
              Common questions in Delhi today
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ASK_STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q, true)}
                  className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/12 text-left text-xs font-semibold text-[#343A32] hover:border-[#3D6048]/40 active:scale-[0.99] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rounded Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input, false);
        }}
        className="pt-2 pb-2 shrink-0"
      >
        <div className="flex items-center gap-2 rounded-3xl bg-[#FBF8F1] border border-[#343A32]/15 p-1.5 pl-4 shadow-sm focus-within:border-[#3D6048]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about commutes, masks, heating, plants..."
            aria-label="Ask Ventura about sustainable alternatives"
            className="flex-1 min-w-0 bg-transparent text-sm text-[#343A32] placeholder:text-[#343A32]/45 focus:outline-none py-2"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !loading
                ? 'bg-[#3D6048] text-[#FBF8F1] hover:bg-[#3D6048]/90 active:scale-95'
                : 'bg-[#343A32]/10 text-[#343A32]/35 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Slide-Up Detail Sheet for Assistant Cards */}
      <DetailSheet
        open={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        subtitle={selectedCard?.card.category}
        title={selectedCard?.card.title ?? ''}
        footer={
          selectedCard && (
            <button
              type="button"
              onClick={() => {
                handleSaveCard(selectedCard.card, selectedCard.key);
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
            <ImpactLabel impact={selectedCard.card.impact} />
            <p className="text-sm text-[#343A32]/85 leading-relaxed">
              {selectedCard.card.explanation}
            </p>
            <div className="rounded-2xl bg-[#F6F0E5] p-4 space-y-1.5">
              <p className="text-xs font-bold text-[#3D6048]">
                Practical benefit
              </p>
              <p className="text-sm text-[#343A32]/85 leading-relaxed">
                {selectedCard.card.benefit}
              </p>
            </div>
          </div>
        )}
      </DetailSheet>
    </div>
  );
};
