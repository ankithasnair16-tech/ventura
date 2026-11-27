import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { OnboardingProfile } from '../types/ventura';
import { ONBOARDING_QUESTIONS } from '../data/venturaContent';
import { VenturaLogo } from './VenturaLogo';

interface OnboardingFlowProps {
  initialProfile: OnboardingProfile;
  initialStep?: number;
  onComplete: (profile: OnboardingProfile) => void;
  onCancel: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialProfile,
  initialStep = 0,
  onComplete,
  onCancel,
}) => {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [draft, setDraft] = useState<OnboardingProfile>({
    priority: initialProfile.completed ? initialProfile.priority : '',
    household: initialProfile.completed ? initialProfile.household : '',
    routine: initialProfile.completed ? initialProfile.routine : '',
    completed: initialProfile.completed,
  });

  const question = ONBOARDING_QUESTIONS[stepIndex];
  const selectedValue = draft[question.id];
  const isLastStep = stepIndex === ONBOARDING_QUESTIONS.length - 1;

  const handleSelectOption = (label: string) => {
    setDraft((prev) => ({
      ...prev,
      [question.id]: label,
    }));
  };

  const handleContinue = () => {
    if (!selectedValue) return;
    if (isLastStep) {
      onComplete({
        ...draft,
        completed: true,
      });
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      onCancel();
    } else {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F6F0E5] flex flex-col justify-between max-w-xl mx-auto px-5 pt-5 pb-7">
      {/* Top Progress & Exit */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <VenturaLogo size="sm" />
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close personalization"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#FBF8F1] border border-[#343A32]/10 flex items-center justify-center text-[#343A32]/75 hover:text-[#343A32] active:scale-95 transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#3D6048]">
            <span>Personalize your plan</span>
            <span className="tabular-nums">
              Question {stepIndex + 1} of {ONBOARDING_QUESTIONS.length}
            </span>
          </div>
          <div
            className="grid grid-cols-3 gap-2"
            role="progressbar"
            aria-valuenow={stepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={ONBOARDING_QUESTIONS.length}
          >
            {ONBOARDING_QUESTIONS.map((q, idx) => {
              const filled = idx <= stepIndex;
              return (
                <div
                  key={q.step}
                  className={`h-2 rounded-full transition-colors duration-200 ${
                    filled ? 'bg-[#3D6048]' : 'bg-[#343A32]/12'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Question Header */}
        <div className="pt-2 space-y-2">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight text-[#343A32]">
            {question.prompt}
          </h1>
          <p className="text-sm text-[#343A32]/75 leading-relaxed">
            {question.helper}
          </p>
        </div>

        {/* Large Selectable Cards */}
        <div className="space-y-2.5 pt-1" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((opt) => {
            const isSelected = selectedValue === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.label)}
                className={`w-full min-h-[68px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-150 active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#3D6048] border-[#3D6048] text-[#FBF8F1] shadow-sm'
                    : 'bg-[#FBF8F1] border-[#343A32]/12 text-[#343A32] hover:border-[#3D6048]/40'
                }`}
              >
                <div className="space-y-0.5 pr-2">
                  <p className="text-[15px] font-bold leading-snug">
                    {opt.label}
                  </p>
                  <p
                    className={`text-xs leading-relaxed ${
                      isSelected ? 'text-[#FBF8F1]/85' : 'text-[#343A32]/65'
                    }`}
                  >
                    {opt.detail}
                  </p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#E8C879] text-[#343A32]'
                      : 'border border-[#343A32]/20 bg-[#F6F0E5]'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" strokeWidth={2.8} aria-hidden="true" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls: Back & Continue */}
      <div className="pt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="min-h-[50px] px-5 py-3 rounded-2xl bg-[#FBF8F1] border border-[#343A32]/12 text-sm font-bold text-[#343A32] flex items-center justify-center gap-1.5 hover:bg-[#FBF8F1]/80 active:scale-[0.98] transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedValue}
          className={`flex-1 min-h-[50px] px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            selectedValue
              ? 'bg-[#3D6048] text-[#FBF8F1] hover:bg-[#3D6048]/95 active:scale-[0.98] shadow-sm'
              : 'bg-[#343A32]/12 text-[#343A32]/40 cursor-not-allowed'
          }`}
        >
          <span>{isLastStep ? 'See my personal plan' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
