import { NebulaSvgLogo, TelegramSvg } from "@/components/layout/NebulaSvg";

export default function MaintenanceViewPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-700/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1.5s" }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <NebulaSvgLogo size={72} />
            <div className="absolute inset-0 bg-purple-500/15 blur-2xl rounded-full" />
          </div>
        </div>

        {/* Animated wrench icon */}
        <div className="flex justify-center mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 animate-spin" style={{ animationDuration: "8s" }}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Under Maintenance
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          The panel is currently undergoing scheduled maintenance. We'll be back online shortly. Thank you for your patience.
        </p>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-purple-300">Maintenance in Progress</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Our team is working hard to restore services. Please check back in a few minutes.
          </p>
        </div>

        <div className="space-y-1">
          <a
            href="https://t.me/RianModss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400/60 hover:text-blue-400 transition-colors"
          >
            <TelegramSvg size={12} />
            Contact @RianModss for updates
          </a>
          <p className="text-xs text-muted-foreground/30 block">
            &copy; {new Date().getFullYear()} RianModss &mdash; Nebula Panel
          </p>
        </div>
      </div>
    </div>
  );
}
