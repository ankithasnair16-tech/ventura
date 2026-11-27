import React from 'react';

export const QUESTIONS = [
  {
    key: 'household',
    title: '1. Who lives with you?',
    options: [
      'Just me',
      'Family with children',
      'Older adults at home',
      'Someone with asthma',
    ],
  },
  {
    key: 'travel',
    title: '2. How do you usually travel?',
    options: [
      'Walk or cycle',
      'Public transport',
      'Car or two-wheeler',
      'Mostly work from home',
    ],
  },
  {
    key: 'cooking',
    title: '3. What do you cook with?',
    options: [
      'LPG or gas',
      'Induction or electric',
      'Wood or coal',
      'Not sure',
    ],
  },
  {
    key: 'outdoor_time',
    title: '4. How much time do you spend outdoors?',
    options: [
      'Little',
      'Some',
      'A lot',
    ],
  },
];

export function QuickStartSection({ answers, onAnswerChange }) {
  return (
    <div className="section-card">
      <div className="section-title">⚡ QUICK START</div>
      <div className="section-subtitle">Tap an option in each category to tailor your daily plan:</div>

      {QUESTIONS.map((q) => {
        const currentVal = answers[q.key];
        return (
          <div key={q.key}>
            <div className="question-title">{q.title}</div>
            <div className="options-2col-grid">
              {q.options.map((opt) => {
                const isSelected = opt === currentVal;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`btn-option ${isSelected ? 'btn-option-selected' : 'btn-option-unselected'}`}
                    onClick={() => onAnswerChange(q.key, opt)}
                  >
                    {isSelected ? `✓ ${opt}` : opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
