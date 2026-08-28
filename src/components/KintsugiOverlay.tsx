import React from 'react';

interface KintsugiOverlayProps {
  repairs: number;
  className?: string;
  intensity?: 'subtle' | 'vibrant' | 'radiant';
}

export const KintsugiOverlay: React.FC<KintsugiOverlayProps> = ({
  repairs,
  className = '',
  intensity = 'vibrant',
}) => {
  if (repairs <= 0) return null;

  // Tier 1: 1 repair (single bold diagonal seam with 2 small capillaries)
  // Tier 2: 2 repairs (converging dual fault-lines with multiple fracture branches)
  // Tier 3: 3+ repairs (masterwork mosaic lacquer network across all fragments)
  const tier = repairs >= 3 ? 3 : repairs === 2 ? 2 : 1;

  const opacityClass =
    intensity === 'subtle'
      ? 'opacity-60'
      : intensity === 'radiant'
      ? 'opacity-100'
      : 'opacity-90';

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-700 ${opacityClass} ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Molten Gold Gradient */}
          <linearGradient id={`kintsugi-gold-${repairs}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A66D03" />
            <stop offset="30%" stopColor="#BF8F54" />
            <stop offset="60%" stopColor="#F2E3B6" />
            <stop offset="100%" stopColor="#A66D03" />
          </linearGradient>

          {/* Shimmering Dynamic Gold Light Gradient for animated pulse */}
          <linearGradient id={`kintsugi-gleam-${repairs}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BF8F54" stopOpacity="0.2">
              <animate attributeName="stop-opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#F2E3B6" stopOpacity="0.95">
              <animate attributeName="stop-opacity" values="0.95;0.3;0.95" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#A66D03" stopOpacity="0.2">
              <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Soft Bloom Filter */}
          <filter id={`kintsugi-glow-${repairs}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Golden Lacquer Glow Background Wash */}
        <path
          d={
            tier === 1
              ? "M 0,35 Q 120,60 190,110 T 400,195"
              : tier === 2
              ? "M 0,40 Q 140,70 210,120 T 400,185 M 210,120 Q 280,60 400,20"
              : "M 0,30 Q 130,55 195,115 T 400,180 M 195,115 Q 260,50 400,15 M 120,53 Q 160,160 270,240 M 310,155 Q 360,200 400,230"
          }
          fill="none"
          stroke="#BF8F54"
          strokeWidth={tier >= 3 ? "7" : "5"}
          strokeOpacity="0.18"
          filter={`url(#kintsugi-glow-${repairs})`}
        />

        {/* Deep Amber Lacquer Bed */}
        <path
          d={
            tier === 1
              ? "M 0,35 Q 120,60 190,110 T 400,195"
              : tier === 2
              ? "M 0,40 Q 140,70 210,120 T 400,185 M 210,120 Q 280,60 400,20"
              : "M 0,30 Q 130,55 195,115 T 400,180 M 195,115 Q 260,50 400,15 M 120,53 Q 160,160 270,240 M 310,155 Q 360,200 400,230"
          }
          fill="none"
          stroke="#592315"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.85"
        />

        {/* Primary Molten Gold Lacquer Seam */}
        <path
          d={
            tier === 1
              ? "M 0,35 Q 120,60 190,110 T 400,195"
              : tier === 2
              ? "M 0,40 Q 140,70 210,120 T 400,185 M 210,120 Q 280,60 400,20"
              : "M 0,30 Q 130,55 195,115 T 400,180 M 195,115 Q 260,50 400,15 M 120,53 Q 160,160 270,240 M 310,155 Q 360,200 400,230"
          }
          fill="none"
          stroke={`url(#kintsugi-gold-${repairs})`}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary Delicate Capillaries & Micro-Cracks for Multi-Repairs */}
        {tier >= 2 && (
          <path
            d="M 60,47 Q 85,15 130,0 M 270,82 Q 330,120 370,105 M 160,160 Q 110,210 90,240"
            fill="none"
            stroke="#BF8F54"
            strokeWidth="1.1"
            strokeOpacity="0.7"
            strokeDasharray="4 2"
          />
        )}

        {tier >= 3 && (
          <path
            d="M 230,135 Q 290,190 320,240 M 0,160 Q 60,180 120,170 M 240,40 Q 300,10 350,0"
            fill="none"
            stroke="#F2E3B6"
            strokeWidth="1"
            strokeOpacity="0.8"
            strokeDasharray="6 3"
          />
        )}

        {/* Moving Luminous Pulse Traveling along the Gold Faults */}
        <path
          d={
            tier === 1
              ? "M 0,35 Q 120,60 190,110 T 400,195"
              : tier === 2
              ? "M 0,40 Q 140,70 210,120 T 400,185 M 210,120 Q 280,60 400,20"
              : "M 0,30 Q 130,55 195,115 T 400,180 M 195,115 Q 260,50 400,15 M 120,53 Q 160,160 270,240"
          }
          fill="none"
          stroke={`url(#kintsugi-gleam-${repairs})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="35 120"
          className="animate-kintsugi-pulse"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="300"
            to="0"
            dur={tier >= 3 ? "4s" : "6s"}
            repeatCount="indefinite"
          />
        </path>

        {/* Golden Nodule Points / Molten Solder Joints at Fragment Intersections */}
        <g className="golden-nodules">
          <circle cx="195" cy="115" r={tier >= 3 ? "3.5" : "2.8"} fill="#F2E3B6">
            <animate attributeName="r" values="2.5;3.8;2.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="195" cy="115" r={tier >= 3 ? "6" : "5"} fill="#BF8F54" opacity="0.35">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {tier >= 2 && (
            <>
              <circle cx="120" cy="53" r="2.2" fill="#BF8F54" />
              <circle cx="280" cy="60" r="2.4" fill="#F2E3B6">
                <animate attributeName="r" values="2;3.2;2" dur="3s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {tier >= 3 && (
            <>
              <circle cx="270" cy="175" r="2.5" fill="#F2E3B6" />
              <circle cx="310" cy="155" r="2.2" fill="#BF8F54" />
              <circle cx="60" cy="47" r="2" fill="#A66D03" />
            </>
          )}
        </g>

        {/* Golden Lacquer Powder Specks */}
        {tier >= 3 && (
          <g className="gold-dust" opacity="0.65">
            <circle cx="170" cy="90" r="1" fill="#F2E3B6" />
            <circle cx="220" cy="130" r="0.8" fill="#BF8F54" />
            <circle cx="140" cy="70" r="1.2" fill="#F2E3B6" />
            <circle cx="260" cy="100" r="0.9" fill="#A66D03" />
            <circle cx="340" cy="170" r="1.1" fill="#F2E3B6" />
            <circle cx="80" cy="60" r="0.7" fill="#BF8F54" />
          </g>
        )}
      </svg>
    </div>
  );
};
