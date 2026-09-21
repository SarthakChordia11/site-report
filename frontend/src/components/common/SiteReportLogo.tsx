import React from 'react';

interface SiteReportLogoProps {
  className?: string;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SiteReportLogo: React.FC<SiteReportLogoProps> = ({
  className = '',
  isDark = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Geometric Cube Icon matching the reference image */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Isometric Cube Shape */}
          <path
            d="M18 3L32 10.5V25.5L18 33L4 25.5V10.5L18 3Z"
            fill="#0E0E0E"
            stroke="#FF6A00"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M18 3V33"
            stroke="#FF6A00"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M18 18L32 10.5"
            stroke="#FF6A00"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M18 18L4 10.5"
            stroke="#FF6A00"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Internal orange accent polygon */}
          <polygon
            points="18,18 30,11.5 18,5.5 6,11.5"
            fill="#FF6A00"
            fillOpacity="0.22"
          />
        </svg>
      </div>

      {/* Brand Text: SiteReport in dark or white + AI in #FF6A00 */}
      <div className={`font-bold tracking-tight ${textSizes[size]}`}>
        <span className={isDark ? 'text-white' : 'text-[#0E0E0E]'}>
          SiteReport
        </span>
        <span className="text-[#FF6A00] font-extrabold ml-0.5">
          AI
        </span>
      </div>
    </div>
  );
};
