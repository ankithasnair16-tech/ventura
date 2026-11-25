import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AirStatusCard } from './components/AirStatusCard';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { GetStartedButton } from './components/GetStartedButton';
import { getAirQuality } from './services/api';

export function App() {
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAirData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAirQuality();
      setReading(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to air quality sensors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirData();
  }, []);

  const handleGetStarted = () => {
    console.log('Get Started triggered');
  };

  return (
    <main className="app-container">
      <Header />
      <HeroSection />

      {loading && <LoadingState />}

      {!loading && error && (
        <ErrorState error={error} onRetry={loadAirData} />
      )}

      {!loading && !error && reading && (
        <>
          <AirStatusCard reading={reading} />
          <GetStartedButton onClick={handleGetStarted} />
        </>
      )}

      <footer className="ventura-footer">
        {reading?.timestamp
          ? `Updated ${reading.timestamp} • Ventura Delhi Air`
          : 'Ventura • Delhi Clean Air'}
      </footer>
    </main>
  );
}

export default App;
