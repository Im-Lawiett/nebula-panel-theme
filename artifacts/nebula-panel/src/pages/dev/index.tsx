import { Layout } from "@/components/layout/Layout";
import { useGetOverviewStats, useGetUsers, useGetActivity, getGetOverviewStatsQueryKey, getGetUsersQueryKey, getGetActivityQueryKey } from "@workspace/api-client-react";
import { Zap, Users, Server, Shield, Activity, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { cn } from "@/lib/utils";

export default function DevDashboardPage() {
  const { data: stats } = useGetOverviewStats({ query: { queryKey: getGetOverviewStatsQueryKey() } });
  const { data: users } = useGetUsers({ query: { queryKey: getGetUsersQueryKey() } });
  const { data: activity } = useGetActivity({ query: { queryKey: getGetActivityQueryKey() } });

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <Layout requireRole="dev">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-purple-400" />
                <span className="text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">Developer Access</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dev Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Full system control &mdash; restricted to developers only</p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1">
              <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                <TelegramSvg size={12} /> @RianModss
              </a>
              <p className="text-xs text-muted-foreground/40">&copy; {new Date().getFullYear()} RianModss</p>
            </div>
          </div>
        </div>

        {/* Dev quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dev/protect">
            <div className="bg-card border border-purple-500/10 hover:border-purple-500/30 rounded-xl p-5 cursor-pointer transition-all duration-200 group hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-xl transition-colors">
                  <Shield size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Protect Features</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Toggle security protections on/off</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/dev/maintenance">
            <div className="bg-card border border-yellow-500/10 hover:border-yellow-500/30 rounded-xl p-5 cursor-pointer transition-all duration-200 group hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 group-hover:bg-yellow-500/20 rounded-xl transition-colors">
                  <AlertTriangle size={24} className="text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Maintenance Mode</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Take the panel offline for maintenance</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Users", value: stats?.totalUsers, color: "text-blue-400" },
            { label: "Servers", value: stats?.totalServers, color: "text-purple-400" },
            { label: "Active", value: stats?.activeServers, color: "text-emerald-400" },
            { label: "Banned", value: stats?.bannedUsers, color: "text-red-400" },
            { label: "Admins", value: stats?.adminCount, color: "text-amber-400" },
            { label: "Devs", value: stats?.devCount, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-white/5 rounded-xl p-4 text-center">
              <p className={cn("text-2xl font-bold", s.color)} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Users size={16} className="text-blue-400" /> All Users
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(users ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold">
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm text-foreground">{u.username}</span>
                    {u.isBanned && <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1 py-0.5 rounded">Banned</span>}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Activity size={16} className="text-blue-400" /> Activity Log
            </h2>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {(activity ?? []).slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{log.action}</p>
                    {log.details && <p className="text-[10px] text-muted-foreground truncate">{log.details}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">{timeAgo(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Dev Dashboard &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
