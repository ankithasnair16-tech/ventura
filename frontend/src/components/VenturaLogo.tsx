import React from 'react';

interface VenturaLogoProps {
  size?: 'sm' | 'md';
  showTagline?: boolean;
}

export const VenturaLogo: React.FC<VenturaLogoProps> = ({
  size = 'md',
  showTagline = false,
}) => {
  const iconDim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : 'text-[22px]';

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className={`${iconDim} rounded-2xl bg-[#3D6048] flex items-center justify-center shadow-sm shadow-[#3D6048]/15 shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
        >
          <path
            d="M25.5 6.5C17.5 6.5 11.2 10.7 8.4 17.8C7.5 20.1 7.2 22.8 7.5 25.5C10.2 25.8 12.9 25.3 15.2 24.3C22.2 21.3 25.5 14.8 25.5 6.5Z"
            fill="#E8C879"
            fillOpacity="0.95"
          />
          <path
            d="M7.5 25.5C11.8 20.8 16.5 16.3 22 11.5"
            stroke="#3D6048"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M12.5 20.5C13.5 17.8 14.8 15.8 16.8 14.5"
            stroke="#3D6048"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`${textSize} font-bold tracking-tight text-[#343A32] whitespace-nowrap`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ventura
        </span>
        {showTagline && (
          <span className="text-[11px] text-[#343A32]/65 font-medium mt-0.5 whitespace-nowrap">
            Cleaner air starts with you
          </span>
        )}
      </div>
    </div>
  );
};
