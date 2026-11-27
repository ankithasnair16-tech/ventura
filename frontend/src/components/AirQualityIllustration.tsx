import React from 'react';
import {
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  RefreshCw,
  Wind,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { AirQualityData } from '../types/ventura';
import { GENERATED_IMAGES, getTimeOfDaySummary } from '../data/venturaContent';

interface HeroAqiCardProps {
  airQuality: AirQualityData | null;
  loadingAqi: boolean;
  onRefreshAqi: () => void;
  onInspectAqi: () => void;
  onInspectMetric: (metric: 'main' | 'pm25' | 'no2') => void;
}

function formatUpdatedTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

export const HeroAqiCard: React.FC<HeroAqiCardProps> = ({
  airQuality,
  loadingAqi,
  onRefreshAqi,
  onInspectAqi,
  onInspectMetric,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (!airQuality) {
    return (
      <section
        aria-label="Delhi air quality overview"
        className="rounded-[28px] bg-[#FBF8F1] border border-[#343A32]/10 p-8 text-center space-y-3 shadow-sm min-h-[300px] flex flex-col items-center justify-center"
      >
        <RefreshCw className="w-6 h-6 text-[#3D6048] animate-spin" />
        <p className="text-sm font-medium text-[#343A32]/75">
          Checking Delhi air quality...
        </p>
      </section>
    );
  }

  const { aqi, level, status, zoneName, source, updatedAt } = airQuality;
  const timeSummary = getTimeOfDaySummary(aqi);

  const sourceLabel =
    source === 'live'
      ? 'Live data'
      : source === 'cached'
        ? 'Cached data'
        : 'Sample data';

  const auraColor =
    level === 'good' || level === 'moderate'
      ? '#A8B99A'
      : level === 'poor'
        ? '#E8C879'
        : '#D98C68';

  const statusToneClass =
    level === 'good' || level === 'moderate'
      ? 'bg-[#3D6048] text-[#FBF8F1]'
      : level === 'poor'
        ? 'bg-[#E8C879] text-[#343A32]'
        : 'bg-[#D98C68] text-[#FBF8F1]';

  const clampedProgress = Math.min(1, Math.max(0.14, aqi / 400));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <section
      aria-label="Delhi air quality hero overview"
      className="relative overflow-hidden rounded-[28px] bg-[#343A32] shadow-md border border-[#343A32]/10"
    >
      {/* Atmospheric Illustrated Backdrop */}
      <img
        src={GENERATED_IMAGES.homeMorning}
        alt="Warm winter morning over Delhi neem trees and rooftops"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#2A3128]/55 via-[#2A3128]/62 to-[#242A22]/90"
        aria-hidden="true"
      />

      <div className="relative z-10 p-4 sm:p-5 space-y-4">
        {/* Compact Glass Header: Zone + Source + Refresh */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 px-3 py-1.5 rounded-2xl bg-[#FBF8F1]/16 backdrop-blur-md border border-[#FBF8F1]/20 text-[#FBF8F1]">
            <p className="text-xs font-bold truncate">{zoneName}</p>
            <p className="text-[11px] text-[#FBF8F1]/80 flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-[#E8C879]">{sourceLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{formatUpdatedTime(updatedAt)}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshAqi}
            disabled={loadingAqi}
            aria-label="Refresh air quality readings"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#FBF8F1]/18 backdrop-blur-md border border-[#FBF8F1]/22 flex items-center justify-center text-[#FBF8F1] hover:bg-[#FBF8F1]/28 active:scale-95 transition-all shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingAqi ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Centerpiece Dynamic AQI Dial + Live Time-of-Day Summary */}
        <button
          type="button"
          onClick={onInspectAqi}
          className="w-full text-center flex flex-col items-center justify-center py-1 group focus-visible:outline-2 focus-visible:outline-[#E8C879] rounded-3xl"
        >
          <div className="relative flex items-center justify-center w-[150px] h-[150px]">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${auraColor}45 0%, ${auraColor}08 68%, transparent 100%)`,
              }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [0.94, 1.07, 0.94],
                      opacity: [0.55, 0.9, 0.55],
                    }
              }
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute inset-2.5 rounded-full border border-[#FBF8F1]/25"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [0.97, 1.03, 0.97],
                      opacity: [0.4, 0.75, 0.4],
                    }
              }
              transition={{
                duration: 5.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative w-[122px] h-[122px] rounded-full bg-[#FBF8F1]/94 backdrop-blur-md shadow-lg flex items-center justify-center">
              <svg
                className="w-[116px] h-[116px] -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#343A32"
                  strokeOpacity="0.1"
                  strokeWidth="6.5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={auraColor}
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[40px] font-extrabold leading-none tracking-tight text-[#343A32] tabular-nums"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {aqi}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#343A32]/65 mt-1">
                  US AQI
                </span>
              </div>
            </div>
          </div>

          {/* Time-Aware Companion Summary */}
          <div className="mt-2.5 space-y-1.5 max-w-sm px-2">
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-extrabold shadow-sm ${statusToneClass}`}
              >
                {status}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E8C879]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{timeSummary.badge}</span>
              </span>
            </div>

            <p className="text-sm font-bold text-[#FBF8F1] leading-snug">
              {timeSummary.headline}
            </p>
            <p className="text-xs text-[#FBF8F1]/82 leading-relaxed">
              {timeSummary.guidance}
            </p>
          </div>
        </button>

        {/* Single Clean Glassmorphic Pollutant Bar */}
        <div className="rounded-2xl bg-[#FBF8F1]/88 backdrop-blur-md border border-[#FBF8F1]/55 p-2 grid grid-cols-3 gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => onInspectMetric('main')}
            className="rounded-xl hover:bg-[#F6F0E5] px-2.5 py-2 text-left transition-colors active:scale-[0.97]"
          >
            <div className="flex items-center justify-between text-[#343A32]/55">
              <Wind className="w-3.5 h-3.5 text-[#3D6048]" aria-hidden="true" />
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-medium text-[#343A32]/65 mt-1">
              Main
            </p>
            <p
              className="text-sm font-extrabold text-[#343A32] tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {airQuality.mainPollutant}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onInspectMetric('pm25')}
            className="rounded-xl hover:bg-[#F6F0E5] px-2.5 py-2 text-left transition-colors active:scale-[0.97]"
          >
            <div className="flex items-center justify-between text-[#343A32]/55">
              <Droplets className="w-3.5 h-3.5 text-[#B5633E]" aria-hidden="true" />
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-medium text-[#343A32]/65 mt-1">
              PM2.5
            </p>
            <p
              className="text-sm font-extrabold text-[#343A32] tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {airQuality.pm25}{' '}
              <span className="text-[10px] font-semibold text-[#343A32]/60">
                µg/m³
              </span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => onInspectMetric('no2')}
            className="rounded-xl hover:bg-[#F6F0E5] px-2.5 py-2 text-left transition-colors active:scale-[0.97]"
          >
            <div className="flex items-center justify-between text-[#343A32]/55">
              <Flame className="w-3.5 h-3.5 text-[#3D6048]" aria-hidden="true" />
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-medium text-[#343A32]/65 mt-1">
              NO2
            </p>
            <p
              className="text-sm font-extrabold text-[#343A32] tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {airQuality.no2}{' '}
              <span className="text-[10px] font-semibold text-[#343A32]/60">
                µg/m³
              </span>
            </p>
          </button>
        </div>
      </div>
    </section>
  );
};
