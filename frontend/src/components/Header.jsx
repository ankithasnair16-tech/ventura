import React from 'react';

export function Header() {
  return (
    <header className="ventura-header" role="banner">
      <span className="ventura-logo-icon" aria-hidden="true">🌿</span>
      <span className="ventura-logo-text">Ventura</span>
      <span className="live-dot-badge">• Delhi Live Air</span>
    </header>
  );
}
