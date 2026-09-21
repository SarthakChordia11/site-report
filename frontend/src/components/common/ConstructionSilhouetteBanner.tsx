import React from 'react';

interface ConstructionSilhouetteBannerProps {
  children?: React.ReactNode;
  className?: string;
}

export const ConstructionSilhouetteBanner: React.FC<ConstructionSilhouetteBannerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-amber-900/40 shadow-2xl bg-[#120d09] ${className}`}>
      {/* Background SVG Artwork */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <svg
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sunset sky gradient matching the construction silhouette photo */}
            <linearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c3742" />
              <stop offset="20%" stopColor="#5a4739" />
              <stop offset="45%" stopColor="#b46422" />
              <stop offset="70%" stopColor="#ee8a1e" />
              <stop offset="88%" stopColor="#f5b33d" />
              <stop offset="100%" stopColor="#fac65d" />
            </linearGradient>

            {/* Sun glow effect */}
            <radialGradient id="sunGlow" cx="92%" cy="75%" r="48%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="22%" stopColor="#ffea88" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#f9921e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#e65100" stopOpacity="0" />
            </radialGradient>

            {/* Atmospheric haze / clouds */}
            <linearGradient id="cloudHaze" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e1814" stopOpacity="0.6" />
              <stop offset="30%" stopColor="#a35818" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#e28c12" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2e1f13" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* Sky Background */}
          <rect width="1000" height="560" fill="url(#sunsetSky)" />

          {/* Clouds / atmospheric texture */}
          <path
            d="M0 160 Q 250 120, 500 170 T 1000 140 L 1000 280 Q 750 310, 500 260 T 0 290 Z"
            fill="url(#cloudHaze)"
          />
          <path
            d="M0 240 Q 300 210, 600 250 T 1000 220 L 1000 360 Q 700 380, 400 330 T 0 350 Z"
            fill="#d97706"
            opacity="0.35"
          />

          {/* Bright setting sun on the right horizon */}
          <circle cx="920" cy="410" r="160" fill="url(#sunGlow)" />
          <circle cx="920" cy="410" r="38" fill="#fffdfa" />

          {/* DISTANT SILHOUETTES & CITY / SITE OUTLINE */}
          <path
            d="M0 430 L120 430 L120 420 L150 420 L150 430 L220 430 L240 415 L260 415 L260 430 L380 430 L390 410 L410 410 L415 430 L520 430 L540 405 L560 405 L570 430 L700 430 L710 420 L730 420 L740 430 L1000 430 L1000 560 L0 560 Z"
            fill="#0c0907"
            opacity="0.95"
          />

          {/* TOWER CRANE (Left & Center-Spanning) */}
          <g fill="#080604" stroke="#080604" strokeWidth="1.5">
            {/* Vertical Columns */}
            <rect x="250" y="140" width="36" height="300" />
            {/* Mast internal lattice */}
            <line x1="250" y1="140" x2="286" y2="180" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="286" y1="140" x2="250" y2="180" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="250" y1="180" x2="286" y2="220" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="286" y1="180" x2="250" y2="220" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="250" y1="220" x2="286" y2="260" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="286" y1="220" x2="250" y2="260" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="250" y1="260" x2="286" y2="300" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="286" y1="260" x2="250" y2="300" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="250" y1="300" x2="286" y2="340" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />
            <line x1="286" y1="300" x2="250" y2="340" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3" />

            {/* Operator Cab & Slewing Unit */}
            <polygon points="244,140 292,140 286,180 250,180" />
            <rect x="238" y="146" width="18" height="24" rx="2" />

            {/* Tower Peak / A-frame Apex */}
            <polygon points="256,140 268,70 280,140" />

            {/* Counter-Jib (Left) */}
            <polygon points="250,140 120,150 120,165 250,155" />
            <rect x="115" y="145" width="22" height="42" rx="2" />

            {/* Main Jib (Horizontal Truss extending to the right) */}
            <polygon points="286,140 840,152 840,160 286,155" />

            {/* Jib Lattice Grid */}
            <path
              d="M286 142 L310 154 L335 142 L360 154 L385 142 L410 154 L435 142 L460 154 L485 142 L510 154 L535 142 L560 154 L585 142 L610 154 L635 142 L660 154 L685 142 L710 154 L735 142 L760 154 L785 142 L810 154 L835 142"
              stroke="#080604"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Tie Cables (Pendant lines) */}
            <line x1="268" y1="70" x2="135" y2="150" stroke="#080604" strokeWidth="2.2" />
            <line x1="268" y1="70" x2="480" y2="145" stroke="#080604" strokeWidth="2.2" />
            <line x1="268" y1="70" x2="680" y2="149" stroke="#080604" strokeWidth="1.8" />

            {/* Trolley & Hoist Cable with Hook */}
            <rect x="520" y="152" width="12" height="8" />
            <line x1="526" y1="160" x2="526" y2="240" stroke="#080604" strokeWidth="1.5" />
            <circle cx="526" cy="244" r="3" />
          </g>

          {/* CONCRETE COLUMNS WITH REBAR (Foreground Left & Center) */}
          <g fill="#080604">
            {/* Column 1 (Far Left) */}
            <rect x="65" y="295" width="48" height="180" rx="3" />
            <line x1="72" y1="295" x2="72" y2="240" stroke="#080604" strokeWidth="2.5" />
            <line x1="80" y1="295" x2="80" y2="235" stroke="#080604" strokeWidth="2.5" />
            <line x1="88" y1="295" x2="88" y2="245" stroke="#080604" strokeWidth="2.5" />
            <line x1="96" y1="295" x2="96" y2="230" stroke="#080604" strokeWidth="2.5" />
            <line x1="104" y1="295" x2="104" y2="242" stroke="#080604" strokeWidth="2.5" />
            <line x1="68" y1="260" x2="108" y2="260" stroke="#080604" strokeWidth="1.5" />
            <line x1="68" y1="280" x2="108" y2="280" stroke="#080604" strokeWidth="1.5" />

            {/* Column 2 */}
            <rect x="160" y="275" width="54" height="200" rx="3" />
            <line x1="168" y1="275" x2="168" y2="215" stroke="#080604" strokeWidth="2.5" />
            <line x1="178" y1="275" x2="178" y2="225" stroke="#080604" strokeWidth="2.5" />
            <line x1="188" y1="275" x2="188" y2="210" stroke="#080604" strokeWidth="2.5" />
            <line x1="198" y1="275" x2="198" y2="220" stroke="#080604" strokeWidth="2.5" />
            <line x1="206" y1="275" x2="206" y2="215" stroke="#080604" strokeWidth="2.5" />
            <line x1="164" y1="235" x2="210" y2="235" stroke="#080604" strokeWidth="1.5" />
            <line x1="164" y1="255" x2="210" y2="255" stroke="#080604" strokeWidth="1.5" />

            {/* Column 3 (Mid-ground) */}
            <rect x="305" y="325" width="18" height="150" />
            <line x1="310" y1="325" x2="310" y2="280" stroke="#080604" strokeWidth="2" />
            <line x1="318" y1="325" x2="318" y2="275" stroke="#080604" strokeWidth="2" />

            {/* Column 4 (Center Right) */}
            <rect x="440" y="280" width="48" height="195" rx="3" />
            <line x1="448" y1="280" x2="448" y2="225" stroke="#080604" strokeWidth="2.5" />
            <line x1="458" y1="280" x2="458" y2="235" stroke="#080604" strokeWidth="2.5" />
            <line x1="468" y1="280" x2="468" y2="220" stroke="#080604" strokeWidth="2.5" />
            <line x1="478" y1="280" x2="478" y2="230" stroke="#080604" strokeWidth="2.5" />
            <line x1="464" y1="245" x2="482" y2="245" stroke="#080604" strokeWidth="1.5" />
            <line x1="464" y1="265" x2="482" y2="265" stroke="#080604" strokeWidth="1.5" />

            {/* Column 5 (Right background) */}
            <rect x="575" y="340" width="22" height="135" />
            <line x1="580" y1="340" x2="580" y2="300" stroke="#080604" strokeWidth="2" />
            <line x1="590" y1="340" x2="590" y2="295" stroke="#080604" strokeWidth="2" />
          </g>

          {/* Scaffolding & Formwork ties */}
          <g stroke="#080604" strokeWidth="1.8" opacity="0.85">
            <line x1="40" y1="410" x2="230" y2="410" />
            <line x1="40" y1="380" x2="160" y2="380" />
            <line x1="280" y1="415" x2="500" y2="415" />
            <line x1="500" y1="420" x2="620" y2="420" />
          </g>

          {/* TWO CONSTRUCTION ENGINEERS SILHOUETTES (Foreground Right) */}
          <g fill="#080604">
            {/* ENGINEER 1: Left Engineer with hands on hips holding folded plans */}
            <path d="M688 238 C688 226, 722 226, 722 238 L727 241 L683 241 Z" />
            <ellipse cx="705" cy="241" rx="22" ry="4" />
            <circle cx="705" cy="248" r="9" />
            <rect x="701" y="254" width="8" height="9" />
            <path d="M685 263 L725 263 L733 345 L677 345 Z" />
            <path d="M685 263 L654 300 L675 340 L685 330 L668 300 L692 272 Z" />
            <path d="M725 263 L758 300 L742 342 L732 334 L746 300 L718 272 Z" />
            <polygon points="730,325 765,360 758,368 722,333" />
            <path d="M678 345 L703 345 L698 440 L682 440 Z" />
            <path d="M707 345 L732 345 L738 440 L722 440 Z" />
            <polygon points="680,440 700,440 703,450 674,450" />
            <polygon points="720,440 740,440 748,450 718,450" />

            {/* ENGINEER 2: Right Engineer pointing hand forward holding blueprint open */}
            <path d="M856 242 C856 230, 890 230, 890 242 L895 245 L851 245 Z" />
            <ellipse cx="873" cy="245" rx="22" ry="4" />
            <circle cx="873" cy="252" r="9" />
            <rect x="869" y="258" width="8" height="9" />
            <path d="M853 267 L893 267 L901 345 L845 345 Z" />
            <path d="M853 267 L818 290 L825 315 L858 292 Z" />
            <polygon points="815,280 780,270 788,322 830,332" />
            <path d="M893 267 L930 262 L955 260 L952 268 L925 273 L895 285 Z" />
            <path d="M848 345 L873 345 L868 440 L852 440 Z" />
            <path d="M877 345 L902 345 L908 440 L892 440 Z" />
            <polygon points="850,440 870,440 873,450 844,450" />
            <polygon points="890,440 910,440 918,450 888,450" />
          </g>

          {/* Foreground Solid Ground & Site Slab */}
          <polygon points="0,445 1000,445 1000,560 0,560" fill="#040302" />
          <line x1="0" y1="445" x2="1000" y2="445" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      {/* Dark & Amber Atmospheric Scrim Overlays for pristine typography readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0906]/75 via-[#0c0906]/55 to-[#080604]/90 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#0c0906]/40 to-[#080604]/85 pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

