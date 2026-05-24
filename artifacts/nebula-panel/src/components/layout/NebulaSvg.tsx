// Nebula Panel SVG logo — no emojis
export function NebulaSvgLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nebula-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="60%" stopColor="#4f9eff" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#nebula-grad)" opacity="0.15" />
      <circle cx="32" cy="32" r="20" stroke="url(#nebula-grad)" strokeWidth="1.5" fill="none" />
      <path d="M20 32 L32 16 L44 32 L32 48 Z" fill="url(#nebula-grad)" opacity="0.8" filter="url(#glow)" />
      <circle cx="32" cy="32" r="4" fill="#fff" opacity="0.9" />
      <circle cx="32" cy="32" r="8" stroke="#4f9eff" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}

export function ShieldSvg({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function TelegramSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.03 13.954l-2.94-.918c-.64-.203-.654-.64.135-.954l11.49-4.43c.533-.194 1-.12.18.569z" />
    </svg>
  );
}
