import React from 'react';

const AREA_DISPLAY_ORDER = [
  ['sustainable_alternatives', 'SUSTAINABLE ALTERNATIVES', 'Green choices suited for Delhi living'],
  ['daily_routines', 'DAILY ROUTINES', 'Low-emission daily timing and habits'],
  ['indoor_hacks', 'INDOOR AIR HACKS', 'Simple steps to keep indoor air clean'],
  ['action_impacts', 'IMPACT OF ACTIONS', 'What each action changes in your day'],
];

export function PersonalPlanSection({
  plan,
  dismissedIds = new Set(),
  onDismissTip,
}) {
  const areas = plan?.areas || {};

  return (
    <div>
      <h2 className="ventura-headline">YOUR PERSONAL PLAN</h2>

      {AREA_DISPLAY_ORDER.map(([areaKey, areaTitle, areaDesc]) => {
        const isHighlighted = areaKey === 'sustainable_alternatives';
        const cardClass = isHighlighted ? 'section-card-highlighted' : 'section-card';
        const tips = areas[areaKey] || [];

        return (
          <div key={areaKey} className={cardClass}>
            <div className="section-header-row">
              <h3 className="section-title">{areaTitle}</h3>
              {isHighlighted && (
                <span className="highlight-pill">★ HIGHLIGHTED FOCUS</span>
              )}
            </div>
            <div className="section-subtitle">{areaDesc}</div>

            {tips.length === 0 ? (
              <div style={{ fontSize: '15px', color: '#5A4E46', padding: '8px 0' }}>
                All suggestions in this area have been dismissed.
              </div>
            ) : (
              tips.map((item) => {
                const impactClass = `impact-badge-${item.impact_level.toLowerCase()}`;
                return (
                  <div key={item.id}>
                    <div className="tip-card">
                      <div className="tip-top-row">
                        <span className="tip-tag">{item.tag}</span>
                        <span className={impactClass}>Impact: {item.impact_level}</span>
                      </div>
                      <div className="tip-text">{item.tip}</div>
                      <div className="tip-detail">{item.detail}</div>
                    </div>

                    <div className="dismiss-btn-container">
                      <button
                        type="button"
                        className="btn-dismiss"
                        onClick={() => onDismissTip(item.id)}
                        title="Hide this recommendation"
                      >
                        ✕ Not for me
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      <div className="disclaimer-text">
        Guidance note: Impact levels (High, Medium, Low) are general advisory estimates based on standard exposure reductions, not medical advice.
      </div>
    </div>
  );
}
