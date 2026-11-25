import React from 'react';

export function LoadingState() {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <h3 className="state-title">Retrieving Delhi Air Sensors</h3>
      <p className="state-desc">Fetching real-time particulate and gas readings...</p>
    </div>
  );
}
