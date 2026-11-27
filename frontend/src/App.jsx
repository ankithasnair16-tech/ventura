import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AirStatusCard } from './components/AirStatusCard';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { GetStartedButton } from './components/GetStartedButton';
import { AssessmentWizard, QUESTIONS } from './components/AssessmentWizard';
import { PersonalPlanView } from './components/PersonalPlanView';
import { getAirQuality, getPersonalPlan } from './services/api';

export function App() {
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // App view state: 'home' | 'assessment' | 'plan'
  const [viewState, setViewState] = useState('home');

  // Assessment Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    focus: 'Protecting my family',
    household: 'Children',
    routine: 'Mostly indoors',
  });
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Plan state
  const [plan, setPlan] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

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

  const handleStartAssessment = () => {
    setViewState('assessment');
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextStep = async () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await generatePlan(answers, dismissedIds);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setViewState('home');
    }
  };

  const generatePlan = async (assessmentAnswers, dismissedList) => {
    setIsSubmittingPlan(true);
    try {
      const planData = await getPersonalPlan({
        focus: assessmentAnswers.focus,
        household: assessmentAnswers.household,
        routine: assessmentAnswers.routine,
        dismissed_ids: dismissedList,
        dominant_pollutant: reading?.dominant_pollutant,
      });
      setPlan(planData);
      setViewState('plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Could not generate recommendations');
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handleDismissTip = async (tipId) => {
    const updatedDismissed = [...dismissedIds, tipId];
    setDismissedIds(updatedDismissed);
    await generatePlan(answers, updatedDismissed);
  };

  const handleRetakeAssessment = () => {
    setViewState('assessment');
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="app-container">
      {/* Ventura Header with leaf icon and live status */}
      <Header />

      {/* 1. Home View: Hero + Live Air Status Card + Get Started CTA */}
      {viewState === 'home' && (
        <>
          <HeroSection />

          {loading && <LoadingState />}

          {!loading && error && (
            <ErrorState error={error} onRetry={loadAirData} />
          )}

          {!loading && !error && reading && (
            <>
              <AirStatusCard reading={reading} />
              <GetStartedButton onClick={handleStartAssessment} />
            </>
          )}
        </>
      )}

      {/* 2. One-Question-at-a-Time Assessment Wizard */}
      {viewState === 'assessment' && (
        <AssessmentWizard
          currentStep={currentStep}
          answers={answers}
          onSelectOption={handleSelectOption}
          onBack={handlePrevStep}
          onContinue={handleNextStep}
          isSubmitting={isSubmittingPlan}
        />
      )}

      {/* 3. Personal Plan View */}
      {viewState === 'plan' && plan && (
        <PersonalPlanView
          plan={plan}
          answers={answers}
          dominantPollutant={reading?.dominant_pollutant}
          onDismissTip={handleDismissTip}
          onRetakeAssessment={handleRetakeAssessment}
        />
      )}

      {/* Footer */}
      <footer className="ventura-footer">
        {reading?.timestamp
          ? `Updated ${reading.timestamp} • Ventura Delhi Air`
          : 'Ventura • Delhi Clean Air'}
      </footer>
    </main>
  );
}

export default App;
