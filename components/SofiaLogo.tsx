export default function SofiaLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const dims = size === "small" ? "w-7 h-7" : size === "large" ? "w-14 h-14" : "w-10 h-10";
  const textClass = size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-xl";

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`sofia-logo-icon ${dims}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Book shape */}
          <path
            d="M6 8C6 6.9 6.9 6 8 6h10c1.1 0 2 .45 2 1v24c0-.55-.9-1-2-1H8c-1.1 0-2-.9-2-2V8z"
            fill="url(#bookLeft)"
          />
          <path
            d="M34 8c0-1.1-.9-2-2-2H22c-1.1 0-2 .45-2 1v24c0-.55.9-1 2-1h10c1.1 0 2-.9 2-2V8z"
            fill="url(#bookRight)"
          />
          {/* Sparkle star */}
          <path
            d="M20 4l1.5 3.5L25 9l-3.5 1.5L20 14l-1.5-3.5L15 9l3.5-1.5L20 4z"
            fill="url(#sparkle)"
            className="animate-star-twinkle"
          />
          {/* Small stars */}
          <circle cx="10" cy="5" r="1" fill="#f0abfc" className="animate-star-twinkle" style={{ animationDelay: "0.5s" }} />
          <circle cx="30" cy="6" r="0.8" fill="#c084fc" className="animate-star-twinkle" style={{ animationDelay: "1s" }} />
          <circle cx="33" cy="14" r="0.6" fill="#e879f9" className="animate-star-twinkle" style={{ animationDelay: "1.5s" }} />
          {/* Heart on left page */}
          <path
            d="M13 17c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8L13 22.5l2.8-2.7c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0z"
            fill="#f9a8d4"
            opacity="0.6"
          />
          {/* Lines on right page */}
          <rect x="23" y="16" width="8" height="1.2" rx="0.6" fill="#d8b4fe" opacity="0.4" />
          <rect x="23" y="19" width="6" height="1.2" rx="0.6" fill="#d8b4fe" opacity="0.3" />
          <rect x="23" y="22" width="7" height="1.2" rx="0.6" fill="#d8b4fe" opacity="0.25" />
          <defs>
            <linearGradient id="bookLeft" x1="6" y1="6" x2="20" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c084fc" />
              <stop offset="1" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="bookRight" x1="34" y1="6" x2="20" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="sparkle" x1="15" y1="4" x2="25" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fde68a" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className={`font-display ${textClass} font-bold sofia-logo-text`}>
        Sof<span className="sofia-logo-i">i</span>a
      </span>
    </span>
  );
}
