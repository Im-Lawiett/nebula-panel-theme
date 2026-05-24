import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useGetServer, useServerPower, getGetServersQueryKey, getGetServerQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import {
  Server, Play, Square, RotateCcw, Zap, Cpu, HardDrive, Database,
  ArrowLeft, Activity, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusInfo: Record<string, { dot: string; badge: string; label: string; glow: string }> = {
  running:    { dot: "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Running", glow: "rgba(52,211,153,0.1)" },
  stopped:    { dot: "bg-red-400",    badge: "text-red-400 bg-red-400/10 border-red-400/20",       label: "Stopped",    glow: "rgba(239,68,68,0.05)"  },
  installing: { dot: "bg-yellow-400 animate-pulse", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: "Installing", glow: "rgba(234,179,8,0.1)" },
  suspended:  { dot: "bg-orange-400", badge: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Suspended", glow: "rgba(249,115,22,0.05)" },
};

export default function ServerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: server, isLoading } = useGetServer(id, { query: { queryKey: getGetServerQueryKey(id) } });
  const powerMutation = useServerPower();

  const sendPower = (action: "start" | "stop" | "restart" | "kill") => {
    powerMutation.mutate({ id, data: { action } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetServerQueryKey(id) });
        qc.invalidateQueries({ queryKey: getGetServersQueryKey() });
        toast({ title: `Signal "${action}" sent to ${server?.name}` });
      },
      onError: () => toast({ title: "Failed to send power signal", variant: "destructive" }),
    });
  };

  const info = server ? (statusInfo[server.status] ?? statusInfo.stopped) : null;

  const ramUsage = server ? Math.floor(Math.random() * 60 + 20) : 0;
  const cpuUsage = server?.status === "running" ? Math.floor(Math.random() * 50 + 10) : 0;
  const diskUsage = Math.floor(Math.random() * 40 + 10);

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Back button */}
        <button onClick={() => navigate("/servers")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Servers
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {server && info && (
          <>
            {/* Header card */}
            <div className={cn("relative overflow-hidden bg-card border rounded-2xl p-6", info.badge.split(" ")[2])}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${info.glow} 0%, transparent 70%)` }} />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Server size={28} className="text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{server.name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", info.badge)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} />
                        {info.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{server.node}</span>
                      <span className="text-xs text-muted-foreground">Owner: <span className="text-foreground">{server.owner}</span></span>
                    </div>
                  </div>
                </div>

                {/* Power buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => sendPower("start")}
                    disabled={server.status === "running" || powerMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Play size={13} /> Start
                  </button>
                  <button
                    onClick={() => sendPower("stop")}
                    disabled={server.status === "stopped" || powerMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Square size={13} /> Stop
                  </button>
                  <button
                    onClick={() => sendPower("restart")}
                    disabled={powerMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all disabled:opacity-30"
                  >
                    <RotateCcw size={13} /> Restart
                  </button>
                  <button
                    onClick={() => sendPower("kill")}
                    disabled={powerMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-400 text-xs font-semibold transition-all disabled:opacity-30"
                  >
                    <Zap size={13} /> Kill
                  </button>
                </div>
              </div>
            </div>

            {/* Resource usage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Memory Usage", icon: <Database size={18} className="text-purple-400" />, used: ramUsage, total: server.ram, unit: "MB", color: "purple" },
                { label: "CPU Usage", icon: <Cpu size={18} className="text-blue-400" />, used: cpuUsage, total: server.cpu, unit: "%", color: "blue" },
                { label: "Disk Usage", icon: <HardDrive size={18} className="text-cyan-400" />, used: diskUsage, total: 100, unit: "%", color: "cyan" },
              ].map((r) => {
                const pct = Math.min(100, Math.round((r.used / r.total) * 100));
                const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : `bg-${r.color}-500`;
                return (
                  <div key={r.label} className="bg-card border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {r.icon}
                        <span className="text-sm font-medium text-foreground">{r.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {r.unit === "%" ? `${r.used}%` : `${r.used}/${r.total} ${r.unit}`}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", barColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{pct}% used</p>
                  </div>
                );
              })}
            </div>

            {/* Server info */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Info size={16} className="text-blue-400" /> Server Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Server ID", value: `#${server.id}` },
                  { label: "Node", value: server.node },
                  { label: "Owner", value: server.owner },
                  { label: "Status", value: info.label },
                  { label: "RAM Allocated", value: server.ram >= 1024 ? `${server.ram / 1024} GB` : `${server.ram} MB` },
                  { label: "CPU Limit", value: `${server.cpu}%` },
                  { label: "Disk Space", value: server.disk >= 1024 ? `${server.disk / 1024} GB` : `${server.disk} MB` },
                  { label: "Uptime", value: server.status === "running" ? "Active" : "Offline" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                    <p className="text-sm font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated console */}
            <div className="bg-[#0a0e1a] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">console</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity size={12} className={cn("transition-colors", server.status === "running" ? "text-emerald-400" : "text-muted-foreground")} />
                  <span className="text-[10px] text-muted-foreground">{server.status === "running" ? "Live" : "Offline"}</span>
                </div>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-400/80 space-y-1 min-h-[100px]">
                {server.status === "running" ? (
                  <>
                    <p><span className="text-blue-400/60">[INFO]</span> Server started successfully</p>
                    <p><span className="text-blue-400/60">[INFO]</span> Loading plugins...</p>
                    <p><span className="text-emerald-400/80">[DONE]</span> Server is ready on port 25565</p>
                    <p className="text-muted-foreground/40">{">"} _</p>
                  </>
                ) : (
                  <p className="text-muted-foreground/40">Server is {server.status}. Start the server to view console output.</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Nebula Panel &mdash; <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
