import { Layout } from "@/components/layout/Layout";
import { useGetOverviewStats, useGetActivity, useGetServers, getGetOverviewStatsQueryKey, getGetActivityQueryKey, getGetServersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { Users, Server, Activity, ShieldAlert, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  stopped: "text-red-400 bg-red-400/10 border-red-400/20",
  installing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  suspended: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

function StatCard({ label, value, icon, color }: { label: string; value: number | undefined; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn("bg-card border rounded-xl p-5 flex items-center gap-4", color)}>
      <div className="p-3 rounded-lg bg-white/5 shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {value ?? "—"}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useGetOverviewStats({ query: { queryKey: getGetOverviewStatsQueryKey() } });
  const { data: activity, isLoading: actLoading } = useGetActivity({ query: { queryKey: getGetActivityQueryKey() } });
  const { data: servers } = useGetServers({ query: { queryKey: getGetServersQueryKey() } });

  const recentServers = (servers ?? []).slice(0, 4);

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
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back, <span className="text-blue-400">{user?.username}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what's happening in your panel</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/50 bg-card border border-white/5 rounded-lg px-3 py-2">
            <TelegramSvg size={12} />
            <span>
              Nebula Panel by{" "}
              <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/70 hover:text-blue-400">
                @RianModss
              </a>
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Users"    value={stats?.totalUsers}    icon={<Users      size={20} className="text-blue-400"   />} color="border-blue-500/10"    />
          <StatCard label="Total Servers"  value={stats?.totalServers}  icon={<Server     size={20} className="text-purple-400" />} color="border-purple-500/10"  />
          <StatCard label="Active Servers" value={stats?.activeServers} icon={<Play       size={20} className="text-emerald-400" />} color="border-emerald-500/10" />
          <StatCard label="Banned Users"   value={stats?.bannedUsers}   icon={<ShieldAlert size={20} className="text-red-400"   />} color="border-red-500/10"     />
          <StatCard label="Admins"         value={stats?.adminCount}    icon={<Users      size={20} className="text-amber-400"  />} color="border-amber-500/10"   />
          <StatCard label="Devs"           value={stats?.devCount}      icon={<Zap        size={20} className="text-cyan-400"   />} color="border-cyan-500/10"    />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent servers */}
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Recent Servers
              </h2>
              <a href="/servers" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all</a>
            </div>
            <div className="space-y-3">
              {recentServers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No servers found</p>
              )}
              {recentServers.map((srv) => (
                <div key={srv.id} data-testid={`card-server-${srv.id}`} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <Server size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{srv.name}</p>
                      <p className="text-xs text-muted-foreground">{srv.owner} · {srv.node}</p>
                    </div>
                  </div>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", statusColors[srv.status])}>
                    {srv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-blue-400" />
              <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Recent Activity
              </h2>
            </div>
            <div className="space-y-3">
              {actLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>}
              {(activity ?? []).slice(0, 6).map((log) => (
                <div key={log.id} data-testid={`item-activity-${log.id}`} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.action}</p>
                    {log.details && <p className="text-xs text-muted-foreground truncate">{log.details}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{log.user}</p>
                    <p className="text-[10px] text-muted-foreground/50">{timeAgo(log.timestamp)}</p>
                  </div>
                </div>
              ))}
              {!actLoading && (activity ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground/30">
            Nebula Panel &mdash; Developed by{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/50 hover:text-blue-400 transition-colors">
              @RianModss
            </a>{" "}
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
