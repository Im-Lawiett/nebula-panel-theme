import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Bell, Search, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  info:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  error:   "bg-red-500/10 border-red-500/20 text-red-400",
};

const typeDot: Record<string, string> = {
  info:    "bg-blue-400",
  warning: "bg-yellow-400",
  success: "bg-emerald-400",
  error:   "bg-red-400",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Header() {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: notifications } = useGetNotifications({ query: { queryKey: getGetNotificationsQueryKey() } });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) });
  };

  const handleMarkAll = () => {
    markAll.mutate(undefined, { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) });
  };

  return (
    <header className="h-14 border-b border-white/5 bg-[hsl(var(--sidebar))/80] backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-background/50 border border-white/8 rounded-lg pl-8 pr-4 py-1.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/40 focus:bg-background transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className={cn(
            "relative p-2 rounded-lg transition-all",
            showNotifs ? "bg-white/8 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_6px_rgba(79,158,255,0.6)]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="font-semibold text-sm text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Notifications {unread > 0 && <span className="text-blue-400 ml-1">({unread})</span>}
              </h3>
              {unread > 0 && (
                <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(notifications ?? []).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications</div>
              )}
              {(notifications ?? []).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={cn(
                    "px-4 py-3 border-b border-white/5 last:border-0 transition-colors",
                    !n.read ? "bg-blue-500/5 cursor-pointer hover:bg-blue-500/10" : "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", typeDot[n.type] ?? "bg-blue-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile link */}
      <Link href="/profile">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_8px_rgba(79,158,255,0.3)] group-hover:shadow-[0_0_12px_rgba(79,158,255,0.5)] transition-all">
            {user?.username[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-none">{user?.username}</p>
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </Link>
    </header>
  );
}
