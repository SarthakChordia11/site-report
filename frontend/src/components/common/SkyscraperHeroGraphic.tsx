import React from 'react';

export const SkyscraperHeroGraphic: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full min-h-[380px] lg:min-h-[440px] flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 540 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[460px]"
      >
        <defs>
          <linearGradient id="orangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8533" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF6A00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E65F00" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="buildingGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1E1E1E" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0E0E0E" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity="0.15" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glow */}
        <circle cx="360" cy="180" r="180" fill="#FF6A00" fillOpacity="0.08" filter="url(#glowEffect)" />
        <circle cx="280" cy="280" r="120" fill="#FF8533" fillOpacity="0.05" />

        {/* Deep background secondary tower silhouettes */}
        <polygon points="120,460 120,240 180,240 180,460" fill="#141414" />
        <polygon points="190,460 190,190 240,190 240,460" fill="#181818" />
        <polygon points="430,460 430,220 480,220 480,460" fill="#141414" />

        {/* Main High-Rise Building Structure */}
        <polygon points="220,460 220,110 390,110 390,460" fill="url(#buildingGradient)" stroke="#262626" strokeWidth="1.5" />

        {/* Vertical Structural Steel Columns (Orange highlighted) */}
        <line x1="240" y1="110" x2="240" y2="460" stroke="#FF6A00" strokeWidth="1.8" strokeOpacity="0.65" />
        <line x1="280" y1="110" x2="280" y2="460" stroke="#FF6A00" strokeWidth="2.2" strokeOpacity="0.8" />
        <line x1="330" y1="110" x2="330" y2="460" stroke="#FF6A00" strokeWidth="2.2" strokeOpacity="0.8" />
        <line x1="370" y1="110" x2="370" y2="460" stroke="#FF6A00" strokeWidth="1.8" strokeOpacity="0.65" />

        {/* Floor Slabs / Horizontal Beams */}
        {[130, 155, 180, 205, 230, 255, 280, 305, 330, 355, 380, 405, 430, 455].map((y, i) => (
          <g key={y}>
            <line x1="220" y1={y} x2="390" y2={y} stroke="#FF6A00" strokeWidth={i % 3 === 0 ? "2" : "1.2"} strokeOpacity={0.75 - (i * 0.02)} />
            {/* Window / Light Grid Nodes */}
            <circle cx="255" cy={y - 10} r="2" fill="#FFFFFF" fillOpacity={i % 2 === 0 ? "0.8" : "0.3"} />
            <circle cx="305" cy={y - 10} r="2.5" fill="#FF8533" fillOpacity={i % 3 === 0 ? "0.9" : "0.4"} />
            <circle cx="350" cy={y - 10} r="2" fill="#FFFFFF" fillOpacity={i % 4 === 0 ? "0.7" : "0.2"} />
          </g>
        ))}

        {/* Diagonal Cross-Bracing / Scaffolding Lattice */}
        {[110, 160, 210, 260, 310, 360, 410].map((y) => (
          <g key={`cross-${y}`}>
            <line x1="240" y1={y} x2="280" y2={y + 50} stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="280" y1={y} x2="240" y2={y + 50} stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="280" y1={y} x2="330" y2={y + 50} stroke="#FF6A00" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="330" y1={y} x2="280" y2={y + 50} stroke="#FF6A00" strokeWidth="1.2" strokeOpacity="0.6" />
            <line x1="330" y1={y} x2="370" y2={y + 50} stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="370" y1={y} x2="330" y2={y + 50} stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.5" />
          </g>
        ))}

        {/* Top Crane Mast (Vertical Tower) */}
        <polygon points="310,110 310,35 322,35 322,110" fill="#1E1E1E" stroke="#FF6A00" strokeWidth="1.5" />
        {/* Crane Tower Truss */}
        {[45, 60, 75, 90, 105].map((cy) => (
          <g key={`crane-${cy}`}>
            <line x1="310" y1={cy} x2="322" y2={cy} stroke="#FF6A00" strokeWidth="1" />
            <line x1="310" y1={cy - 12} x2="322" y2={cy} stroke="#FF6A00" strokeWidth="0.8" />
          </g>
        ))}

        {/* Crane Operator Cab */}
        <rect x="306" y="40" width="16" height="12" rx="2" fill="#FF6A00" />
        <rect x="308" y="42" width="6" height="5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Crane Jib (Long Horizontal Arm extending left and right) */}
        {/* Counter-jib (Right arm with counterweight) */}
        <polygon points="316,36 390,38 385,46 316,42" fill="#1A1A1A" stroke="#FF6A00" strokeWidth="1.4" />
        <rect x="375" y="40" width="18" height="14" rx="1.5" fill="#333333" stroke="#FF6A00" strokeWidth="1" />

        {/* Main Jib (Left long arm reaching out) */}
        <polygon points="316,36 130,34 135,42 316,42" fill="#1A1A1A" stroke="#FF6A00" strokeWidth="1.4" />
        {/* Jib Internal Trusses */}
        {[160, 195, 230, 265, 300].map((jx) => (
          <g key={`jib-${jx}`}>
            <line x1={jx} y1="35" x2={jx} y2="42" stroke="#FF6A00" strokeWidth="1" />
            <line x1={jx} y1="35" x2={jx + 25} y2="42" stroke="#FF6A00" strokeWidth="0.8" />
          </g>
        ))}

        {/* Crane Apex / Tower Peak & Tension Cables */}
        <polygon points="316,35 316,14 322,35" fill="#FF6A00" />
        <line x1="316" y1="14" x2="150" y2="35" stroke="#FF6A00" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="316" y1="14" x2="230" y2="35" stroke="#FF6A00" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="316" y1="14" x2="385" y2="38" stroke="#FF6A00" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Hoist Trolley & Hook Line */}
        <rect x="180" y="40" width="12" height="6" fill="#FF6A00" rx="1" />
        <line x1="186" y1="46" x2="186" y2="135" stroke="#FF8533" strokeWidth="1.2" strokeDasharray="4 2" />
        
        {/* Suspended Precast Beam load with orange straps */}
        <line x1="186" y1="135" x2="170" y2="148" stroke="#FF6A00" strokeWidth="1" />
        <line x1="186" y1="135" x2="202" y2="148" stroke="#FF6A00" strokeWidth="1" />
        <rect x="160" y="148" width="52" height="10" rx="1.5" fill="#FF6A00" stroke="#FFFFFF" strokeWidth="0.8" />
        <text x="186" y="155" fill="#0E0E0E" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">BEAM-B14</text>

        {/* Glowing Aircraft Beacon on Crane Top */}
        <circle cx="316" cy="14" r="3" fill="#FF3333" filter="url(#glowEffect)" />
        <circle cx="316" cy="14" r="1.5" fill="#FFFFFF" />

        {/* Site Floodlights */}
        <circle cx="230" cy="110" r="3.5" fill="#FFF2E8" filter="url(#glowEffect)" />
        <polygon points="230,110 180,240 260,240" fill="#FF8533" fillOpacity="0.06" />

        <circle cx="380" cy="110" r="3.5" fill="#FFF2E8" filter="url(#glowEffect)" />
        <polygon points="380,110 330,240 410,240" fill="#FF8533" fillOpacity="0.06" />

        {/* Foreground construction site silhouette ground elements */}
        <rect x="0" y="450" width="540" height="10" fill="#0A0A0A" />
      </svg>
    </div>
  );
};
