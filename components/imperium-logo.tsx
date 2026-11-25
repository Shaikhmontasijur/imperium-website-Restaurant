import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "gold" | "white" | "neon";
}

export const ImperiumLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
  variant = "gold",
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-lg tracking-[0.2em]",
    md: "text-2xl tracking-[0.22em]",
    lg: "text-3xl tracking-[0.25em]",
    xl: "text-4xl tracking-[0.28em]",
  };

  const subtextSizes = {
    sm: "text-[9px] tracking-[0.25em]",
    md: "text-[10px] tracking-[0.3em]",
    lg: "text-xs tracking-[0.35em]",
    xl: "text-sm tracking-[0.4em]",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Golden Cloche + Sparkle Star SVG */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(201,162,75,0.4)]"
          aria-label="IMPERIUM Royal Cloche Logo"
          role="img"
        >
          <defs>
            <linearGradient id="imperiumGold" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#F9E7B9" />
              <stop offset="35%" stopColor="#C9A24B" />
              <stop offset="70%" stopColor="#E2C479" />
              <stop offset="100%" stopColor="#8C6B28" />
            </linearGradient>
            <linearGradient id="sparkleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#C9A24B" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sparkle / Four-Point Star above Cloche */}
          <g filter="url(#glowFilter)">
            <path
              d="M50 4 Q50 14 60 14 Q50 14 50 24 Q50 14 40 14 Q50 14 50 4 Z"
              fill="url(#sparkleGlow)"
            />
            {/* Small diagonal sparkle dust */}
            <circle cx="66" cy="10" r="1.5" fill="#F9E7B9" opacity="0.85" />
            <circle cx="34" cy="18" r="1.2" fill="#F9E7B9" opacity="0.75" />
          </g>

          {/* Cloche Dome Handle Ring */}
          <path
            d="M50 25 C47 25 45 27 45 30 C45 32 46.5 33.5 48.5 34 L51.5 34 C53.5 33.5 55 32 55 30 C55 27 53 25 50 25 Z"
            fill="url(#imperiumGold)"
          />
          <circle cx="50" cy="27" r="2.2" fill="#0E0E0E" />

          {/* Serving Dome (Cloche Body) */}
          <path
            d="M18 68 C18 43 32 35 50 35 C68 35 82 43 82 68 Z"
            fill="url(#imperiumGold)"
          />

          {/* Cloche Highlight / Gloss Arc */}
          <path
            d="M26 64 C28 47 38 41 50 40 C43 41 33 47 30 64 Z"
            fill="#FFF"
            opacity="0.3"
          />

          {/* Cloche Bottom Rim */}
          <rect
            x="14"
            y="68"
            width="72"
            height="5"
            rx="2.5"
            fill="url(#imperiumGold)"
          />

          {/* Silver/Gold Serving Platter / Tray Base */}
          <path
            d="M8 77 C8 75.5 10 74 13 74 L87 74 C90 74 92 75.5 92 77 C92 78.5 89 80 84 80 L16 80 C11 80 8 78.5 8 77 Z"
            fill="url(#imperiumGold)"
            opacity="0.9"
          />
          <path
            d="M28 80 L34 84 L66 84 L72 80 Z"
            fill="url(#imperiumGold)"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-serif font-black uppercase text-imperium-ivory ${textSizes[size]} leading-none`}
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            IMPERIUM
          </span>
          <span
            className={`font-sans font-semibold uppercase text-imperium-gold ${subtextSizes[size]} mt-1 tracking-widest`}
          >
            Restaurant • Qatar
          </span>
        </div>
      )}
    </div>
  );
};
export default ImperiumLogo;
