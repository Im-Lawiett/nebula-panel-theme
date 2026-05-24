import { useAuth } from "@/lib/auth";
import { TelegramSvg } from "@/components/layout/NebulaSvg";

export default function BannedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-700/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ef4444" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="36" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.3" />
              <circle cx="40" cy="40" r="28" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.5" />
              <line x1="20" y1="20" x2="60" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="40" r="16" fill="#ef4444" opacity="0.1" />
            </svg>
            <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-red-400 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Account Suspended
        </h1>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Your account has been suspended from Nebula Panel. If you believe this is a mistake, please contact the panel administrator.
        </p>

        {/* Ban info */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mb-6 text-left">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-1">Account</p>
              <p className="text-sm font-medium text-foreground">{user?.username ?? "Unknown"}</p>
            </div>
            {user?.banReason && (
              <div>
                <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-1">Reason</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{user.banReason}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                Permanently Suspended
              </span>
            </div>
          </div>
        </div>

        <button
          data-testid="button-logout-banned"
          onClick={logout}
          className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 mb-6"
        >
          Sign Out
        </button>

        <div className="space-y-1">
          <a
            href="https://t.me/RianModss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400/60 hover:text-blue-400 transition-colors"
          >
            <TelegramSvg size={12} />
            Contact @RianModss for support
          </a>
          <p className="text-xs text-muted-foreground/30 block">&copy; {new Date().getFullYear()} RianModss &mdash; Nebula Panel</p>
        </div>
      </div>
    </div>
  );
}
