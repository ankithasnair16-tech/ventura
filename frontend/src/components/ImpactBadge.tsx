import React from 'react';
import { ImpactLevel } from '../types/ventura';

interface ImpactBadgeProps {
  impact: ImpactLevel | string;
  lightOnDark?: boolean;
}

export const ImpactLabel: React.FC<ImpactBadgeProps> = ({
  impact,
  lightOnDark = false,
}) => {
  const raw = String(impact || 'medium').toLowerCase();
  const level: 'high' | 'medium' | 'low' = raw.includes('high')
    ? 'high'
    : raw.includes('low')
      ? 'low'
      : 'medium';

  const activeBars = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  const displayText = level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low';

  const colorClass = lightOnDark
    ? level === 'high'
      ? 'text-[#E8C879]'
      : 'text-[#FBF8F1]/90'
    : level === 'high'
      ? 'text-[#3D6048]'
      : level === 'medium'
        ? 'text-[#B5633E]'
        : 'text-[#5A6356]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${colorClass}`}
    >
      {/* Crisp 3-bar cellular signal icon */}
      <span
        className="inline-flex items-end gap-[2px] h-3 w-3 shrink-0 pb-[1px]"
        aria-hidden="true"
      >
        <span
          className={`w-[2.5px] rounded-full h-1.5 transition-colors ${
            activeBars >= 1 ? 'bg-current opacity-100' : 'bg-current opacity-20'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full h-2.5 transition-colors ${
            activeBars >= 2 ? 'bg-current opacity-100' : 'bg-current opacity-20'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full h-3.5 transition-colors ${
            activeBars >= 3 ? 'bg-current opacity-100' : 'bg-current opacity-20'
          }`}
        />
      </span>
      <span>{displayText} impact</span>
    </span>
  );
};

