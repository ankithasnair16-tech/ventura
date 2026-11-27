import React from 'react';

export const QUESTIONS = [
  {
    id: 'focus',
    question: "What matters most to you right now?",
    subtitle: "Select the goal that best guides your plan today",
    options: [
      {
        value: "Protecting my family",
        desc: "Shielding loved ones, children, and elderly at home",
        icon: "🛡️",
      },
      {
        value: "Staying safer when I'm outdoors",
        desc: "Cutting soot and exhaust during travel and active hours",
        icon: "🚶",
      },
      {
        value: "Keeping the air at home cleaner",
        desc: "Indoor air quality, window sealing, and quiet purification",
        icon: "🏡",
      },
      {
        value: "Making healthier everyday choices",
        desc: "Sustainable routines, eco habits, and low-emission living",
        icon: "🌱",
      },
    ],
  },
  {
    id: 'household',
    question: "Who should Ventura keep in mind when creating your plan?",
    subtitle: "We'll tailor sensitivity alerts and protective steps",
    options: [
      {
        value: "Just me",
        desc: "Single personal plan tailored for individual routines",
        icon: "👤",
      },
      {
        value: "Children",
        desc: "Special care for developing lungs during chilly hours",
        icon: "🎒",
      },
      {
        value: "Older adults",
        desc: "Gentle protection against seasonal respiratory distress",
        icon: "👵",
      },
      {
        value: "Someone with breathing sensitivities",
        desc: "Asthma, bronchitis, or allergen-sensitive protection",
        icon: "🫁",
      },
      {
        value: "My whole household",
        desc: "Comprehensive multi-generational home clean air rules",
        icon: "👨‍👩‍👧‍👦",
      },
    ],
  },
  {
    id: 'routine',
    question: "What does a typical day look like for you?",
    subtitle: "Timing your habits with Delhi's diurnal smog patterns",
    options: [
      {
        value: "Mostly indoors",
        desc: "Work from home, indoor office, or staying inside",
        icon: "🏢",
      },
      {
        value: "Commuting around the city",
        desc: "Roadway travel, public transit, or city traffic",
        icon: "🚗",
      },
      {
        value: "Spending lots of time outdoors",
        desc: "Walking, cycling, field tasks, or outdoor fitness",
        icon: "🏃",
      },
      {
        value: "A mix of everything",
        desc: "Balanced indoor hours with regular daily trips outside",
        icon: "🔄",
      },
    ],
  },
];

export function AssessmentWizard({
  currentStep,
  answers,
  onSelectOption,
  onBack,
  onContinue,
  isSubmitting,
}) {
  const currentQ = QUESTIONS[currentStep];
  const selectedValue = answers[currentQ.id];
  const progressPercent = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  return (
    <section className="assessment-card" aria-labelledby="wizard-step-title">
      {/* Progress Bar & Step Tracker */}
      <div className="wizard-progress-header">
        <div className="wizard-step-pill">
          Question {currentStep + 1} of {QUESTIONS.length}
        </div>
        <span className="wizard-progress-text">{progressPercent}% complete</span>
      </div>

      <div
        className="wizard-progress-bar-track"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="wizard-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Header */}
      <div className="wizard-question-content">
        <h2 id="wizard-step-title" className="wizard-question-title">
          {currentQ.question}
        </h2>
        <p className="wizard-question-subtitle">{currentQ.subtitle}</p>
      </div>

      {/* Answer Cards Grid */}
      <div className="wizard-options-list" role="radiogroup" aria-labelledby="wizard-step-title">
        {currentQ.options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`wizard-option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectOption(currentQ.id, opt.value)}
            >
              <div className="wizard-option-icon" aria-hidden="true">
                {opt.icon}
              </div>
              <div className="wizard-option-text">
                <span className="wizard-option-title">{opt.value}</span>
                <span className="wizard-option-desc">{opt.desc}</span>
              </div>
              <div className="wizard-option-radio" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls: Back & Continue */}
      <div className="wizard-controls">
        {currentStep > 0 ? (
          <button
            type="button"
            className="wizard-btn-secondary"
            onClick={onBack}
            disabled={isSubmitting}
          >
            ← Back
          </button>
        ) : (
          <div /> /* Spacer to keep Continue aligned right */
        )}

        <button
          type="button"
          className="wizard-btn-primary"
          onClick={onContinue}
          disabled={!selectedValue || isSubmitting}
        >
          {isSubmitting
            ? 'Generating Plan...'
            : currentStep === QUESTIONS.length - 1
            ? 'Generate My Plan →'
            : 'Continue →'}
        </button>
      </div>
    </section>
  );
}
