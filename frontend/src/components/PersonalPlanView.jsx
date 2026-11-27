import React from 'react';

const AREA_TITLES = {
  sustainable_alternatives: {
    title: 'SUSTAINABLE ALTERNATIVES',
    subtitle: 'Green, low-emission choices tailored for Delhi living',
    badge: 'Highlighted Priority',
  },
  daily_routines: {
    title: 'DAILY ROUTINES',
    subtitle: 'Low-emission daily timing and protective habits',
  },
  indoor_hacks: {
    title: 'INDOOR AIR HACKS',
    subtitle: 'Simple steps to keep indoor rooms and bedrooms clean',
  },
  action_impacts: {
    title: 'IMPACT OF ACTIONS',
    subtitle: 'How each change reduces personal smog exposure',
  },
};

const AREA_KEYS = [
  'sustainable_alternatives',
  'daily_routines',
  'indoor_hacks',
  'action_impacts',
];

export function PersonalPlanView({
  plan,
  answers,
  dominantPollutant,
  onDismissTip,
  onRetakeAssessment,
}) {
  const areas = plan?.areas || {};

  return (
    <section className="personal-plan-container" aria-labelledby="plan-headline">
      <div className="plan-header-banner">
        <div>
          <span className="plan-badge">🎯 Tailored for Delhi Air</span>
          <h2 id="plan-headline" className="plan-title">
            YOUR PERSONAL CLEAN AIR PLAN
          </h2>
          <p className="plan-meta">
            Targeting dominant pollutant <strong>{dominantPollutant || plan?.dominant_pollutant}</strong> based on your priority for <em>{answers.focus || 'Clean Living'}</em>.
          </p>
        </div>
        <button
          type="button"
          className="plan-retake-btn"
          onClick={onRetakeAssessment}
          title="Adjust answers"
        >
          ✏️ Edit Answers
        </button>
      </div>

      {AREA_KEYS.map((areaKey) => {
        const areaConfig = AREA_TITLES[areaKey];
        const tips = areas[areaKey] || [];
        const isHighlighted = areaKey === 'sustainable_alternatives';

        if (tips.length === 0) return null;

        return (
          <div
            key={areaKey}
            className={`plan-area-card ${isHighlighted ? 'area-highlighted' : ''}`}
          >
            <div className="plan-area-header">
              <div className="plan-area-headings">
                <span className="plan-area-label">{areaConfig.title}</span>
                <span className="plan-area-desc">{areaConfig.subtitle}</span>
              </div>
              {areaConfig.badge && (
                <span className="plan-priority-tag">{areaConfig.badge}</span>
              )}
            </div>

            <div className="plan-tips-list">
              {tips.map((item) => (
                <div key={item.id} className="plan-tip-item">
                  <div className="tip-header-row">
                    <span className={`impact-badge impact-${item.impact_level?.toLowerCase()}`}>
                      {item.impact_level} Impact
                    </span>
                    {item.tag && <span className="tip-tag">{item.tag}</span>}
                  </div>

                  <p className="tip-text">{item.tip}</p>
                  <p className="tip-detail">{item.detail}</p>

                  <div className="tip-actions-row">
                    <button
                      type="button"
                      className="tip-dismiss-btn"
                      onClick={() => onDismissTip(item.id)}
                      title="Hide this recommendation"
                    >
                      Not for me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
