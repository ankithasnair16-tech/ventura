import React from 'react';

export function AirStatusCard({ reading }) {
  if (!reading) return null;

  const {
    aqi,
    pm2_5,
    no2,
    dominant_pollutant,
    category,
    status_color,
    source_label,
  } = reading;

  return (
    <div
      className="air-status-card"
      role="region"
      aria-label="Current Delhi Air Quality Status"
    >
      <div className="air-status-header">
        <span className="air-location">📍 Delhi (National Capital Territory)</span>
        <span className="air-source-label" aria-label="Data provenance">
          {source_label || 'Live data'}
        </span>
      </div>

      <div className="air-reading-row">
        <div
          className="aqi-number"
          style={{ color: status_color || '#B85334' }}
          aria-label={`Air Quality Index: ${aqi}`}
        >
          {aqi}
        </div>
        <div className="aqi-badge-group">
          <span
            className="aqi-badge"
            style={{ backgroundColor: status_color || '#B85334' }}
          >
            {category}
          </span>
          <span className="aqi-standard-label">US Air Quality Index</span>
        </div>
      </div>

      <div className="pollutant-metrics-grid">
        <div className="pollutant-item">
          <div className="pollutant-label">Dominant Threat</div>
          <div className="pollutant-value" style={{ color: '#B85334' }}>
            {dominant_pollutant}
          </div>
        </div>

        <div className="pollutant-item">
          <div className="pollutant-label">Fine Dust (PM2.5)</div>
          <div className="pollutant-value">
            {typeof pm2_5 === 'number' ? pm2_5.toFixed(1) : pm2_5}{' '}
            <span className="pollutant-unit">µg/m³</span>
          </div>
        </div>

        <div className="pollutant-item">
          <div className="pollutant-label">Gas Fumes (NO₂)</div>
          <div className="pollutant-value">
            {typeof no2 === 'number' ? no2.toFixed(1) : no2}{' '}
            <span className="pollutant-unit">µg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
}
