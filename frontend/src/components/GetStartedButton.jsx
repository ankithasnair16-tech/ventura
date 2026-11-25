import React from 'react';

export function GetStartedButton({ onClick }) {
  return (
    <div className="cta-container">
      <button
        type="button"
        className="btn-get-started"
        onClick={onClick}
        aria-label="Get Started with Ventura clean air plan"
      >
        <span>Get Started</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
