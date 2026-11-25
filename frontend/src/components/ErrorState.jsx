import React from 'react';

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-card error-card" role="alert">
      <h3 className="state-title" style={{ color: '#B85334' }}>
        Unable to Load Air Quality
      </h3>
      <p className="state-desc">
        {error || 'Sensor feeds are currently unreachable. Please verify your connection.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-retry"
          aria-label="Retry fetching air quality"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
