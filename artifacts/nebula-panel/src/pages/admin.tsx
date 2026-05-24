import { Layout } from "@/components/layout/Layout";
import { useGetServers, useGetUsers, useGetOverviewStats, getGetServersQueryKey, getGetUsersQueryKey, getGetOverviewStatsQueryKey } from "@workspace/api-client-react";
import { Server, Users, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  stopped: "text-red-400 bg-red-400/10 border-red-400/20",
  installing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  suspended: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function AdminPage() {
  const { data: servers } = useGetServers({ query: { queryKey: getGetServersQueryKey() } });
  const { data: users } = useGetUsers({ query: { queryKey: getGetUsersQueryKey() } });
  const { data: stats } = useGetOverviewStats({ query: { queryKey: getGetOverviewStatsQueryKey() } });

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Server and user overview for administrators</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Servers", value: stats?.totalServers, icon: <Server size={18} className="text-blue-400" />, color: "border-blue-500/10" },
            { label: "Active Servers", value: stats?.activeServers, icon: <Activity size={18} className="text-emerald-400" />, color: "border-emerald-500/10" },
            { label: "Total Users", value: stats?.totalUsers, icon: <Users size={18} className="text-purple-400" />, color: "border-purple-500/10" },
            { label: "Banned Users", value: stats?.bannedUsers, icon: <Shield size={18} className="text-red-400" />, color: "border-red-500/10" },
          ].map((s) => (
            <div key={s.label} className={cn("bg-card border rounded-xl p-4 flex items-center gap-3", s.color)}>
              <div className="p-2 bg-white/5 rounded-lg">{s.icon}</div>
              <div>
                <p className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server list */}
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Server size={16} className="text-blue-400" /> All Servers
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(servers ?? []).map((srv) => (
                <div key={srv.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{srv.name}</p>
                    <p className="text-xs text-muted-foreground">{srv.owner} · {srv.node}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", statusColors[srv.status])}>
                    {srv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User list */}
          <div className="bg-card border border-white/5 rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Users size={16} className="text-purple-400" /> Users Overview
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(users ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                      {u.username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.isBanned && <span className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded-full">Banned</span>}
                    <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Admin Panel &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
