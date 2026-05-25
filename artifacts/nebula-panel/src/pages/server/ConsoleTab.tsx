import { useState, useRef, useEffect, useCallback } from "react";
import { useServerPower, getGetServerQueryKey, getGetServersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw, Zap, ChevronRight, Database, Cpu, HardDrive, Wifi, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Server { id: number; name: string; status: string; owner: string; node: string; ram: number; cpu: number; disk: number; allocation?: string; egg?: string; }

const statusInfo: Record<string, { dot: string; badge: string; label: string }> = {
  running:    { dot: "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Online" },
  stopped:    { dot: "bg-red-400",    badge: "text-red-400 bg-red-400/10 border-red-400/20",       label: "Offline" },
  installing: { dot: "bg-yellow-400 animate-pulse", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: "Installing" },
  suspended:  { dot: "bg-orange-400", badge: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Suspended" },
};

const LOG_LINES = [
  "[00:01:23] [Server thread/INFO]: Starting minecraft server version 1.20.4",
  "[00:01:24] [Server thread/INFO]: Loading properties",
  "[00:01:24] [Server thread/INFO]: Default game type: SURVIVAL",
  "[00:01:25] [Server thread/INFO]: Generating keypair",
  "[00:01:26] [Server thread/INFO]: Starting Minecraft server on *:25565",
  "[00:01:28] [Server thread/INFO]: Preparing level 'world'",
  "[00:01:29] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld",
  "[00:01:31] [Server thread/INFO]: Done (3.104s)! For help, type 'help'",
  "[00:02:10] [User Authenticator #1/INFO]: UUID of player Steve is abc123",
  "[00:02:10] [Server thread/INFO]: Steve[/127.0.0.1:56781] logged in",
  "[00:15:42] [Server thread/INFO]: Steve lost connection: Disconnected",
];

const MAX_CHART_POINTS = 30;
type ChartPoint = { t: string; cpu: number; mem: number; net: number };

function mkPoint(cpu: number, mem: number, net: number): ChartPoint {
  const d = new Date();
  return { t: `${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`, cpu, mem, net };
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}

function fmtUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1224] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toFixed(1)}{p.name === "Net" ? "" : "%"}</p>
      ))}
    </div>
  );
};

export function ConsoleTab({ server }: { server: Server }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const powerMutation = useServerPower();
  const [cmd, setCmd] = useState("");
  const [logs, setLogs] = useState<string[]>(server.status === "running" ? LOG_LINES : ["Server is offline. Start it to see console output."]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const info = statusInfo[server.status] ?? statusInfo.stopped;

  // ── Resource stats state ───────────────────────────────────────────────────
  const [stats, setStats] = useState({ cpu: 0, memPct: 0, diskPct: 0, netRx: 0, netTx: 0, uptime: 0 });
  const [chartData, setChartData] = useState<ChartPoint[]>(() =>
    Array.from({ length: 20 }, () => mkPoint(0, 0, 0))
  );

  const fetchStats = useCallback(async () => {
    if (server.status !== "running") {
      setStats({ cpu: 0, memPct: 0, diskPct: 0, netRx: 0, netTx: 0, uptime: 0 });
      return;
    }
    try {
      const token = localStorage.getItem("nebula_token");
      const r = await fetch(`/api/servers/${server.id}/resources`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) return;
      const d = await r.json();
      const cpu = d.cpuAbsolute ?? 0;
      const memPct = d.memoryLimitBytes > 0 ? Math.round(d.memoryBytes / d.memoryLimitBytes * 100) : 0;
      const diskPct = d.diskLimitBytes > 0 ? Math.round(d.diskBytes / d.diskLimitBytes * 100) : 0;
      const netKb = Math.round((d.networkRxBytes + d.networkTxBytes) / 1024);
      setStats({ cpu, memPct, diskPct, netRx: d.networkRxBytes, netTx: d.networkTxBytes, uptime: d.uptime });
      setChartData((prev) => {
        const next = [...prev, mkPoint(cpu, memPct, netKb)];
        return next.length > MAX_CHART_POINTS ? next.slice(-MAX_CHART_POINTS) : next;
      });
    } catch {}
  }, [server.id, server.status]);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 2000);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => { consoleRef.current?.scrollTo(0, consoleRef.current.scrollHeight); }, [logs]);

  const sendPower = (action: "start" | "stop" | "restart" | "kill") => {
    powerMutation.mutate({ id: server.id, data: { action } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetServerQueryKey(server.id) });
        qc.invalidateQueries({ queryKey: getGetServersQueryKey() });
        toast({ title: `Signal "${action}" sent` });
        if (action === "start") setLogs(LOG_LINES);
        if (action === "stop" || action === "kill") setLogs(["[INFO] Server stopped."]);
        if (action === "restart") setLogs(["[INFO] Restarting...", ...LOG_LINES]);
      },
    });
  };

  const sendCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    setLogs((l) => [...l, `> ${cmd}`, `[Server thread/INFO]: Unknown command: ${cmd}`]);
    setCmd("");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", info.badge)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} /> {info.label}
          </span>
          <span className="text-xs text-muted-foreground">{server.node}</span>
          {server.allocation && <span className="text-xs text-muted-foreground font-mono">{server.allocation}</span>}
          {server.egg && <span className="text-xs text-blue-400/60 bg-blue-500/10 px-2 py-0.5 rounded">{server.egg}</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { action: "start"   as const, label: "Start",   cls: "text-emerald-400 border-emerald-500/30 bg-emerald-600/15 hover:bg-emerald-600/25", icon: <Play size={12} />,     disabled: server.status === "running" },
            { action: "stop"    as const, label: "Stop",    cls: "text-red-400 border-red-500/30 bg-red-600/15 hover:bg-red-600/25",                 icon: <Square size={12} />,   disabled: server.status === "stopped" },
            { action: "restart" as const, label: "Restart", cls: "text-blue-400 border-blue-500/30 bg-blue-600/15 hover:bg-blue-600/25",             icon: <RotateCcw size={12} />, disabled: false },
            { action: "kill"    as const, label: "Kill",    cls: "text-orange-400 border-orange-500/30 bg-orange-600/15 hover:bg-orange-600/25",     icon: <Zap size={12} />,      disabled: false },
          ] as const).map((b) => (
            <button key={b.action} onClick={() => sendPower(b.action)} disabled={b.disabled || powerMutation.isPending}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30", b.cls)}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PTLC Resource Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "CPU",    value: stats.cpu,     unit: "%",  icon: <Cpu size={13} />,      color: "blue",    max: 100 },
          { label: "Memory", value: stats.memPct,  unit: "%",  icon: <Database size={13} />, color: "purple",  max: 100 },
          { label: "Disk",   value: stats.diskPct, unit: "%",  icon: <HardDrive size={13} />,color: "cyan",    max: 100 },
          { label: "Uptime", value: stats.uptime,  unit: "",   icon: <Clock size={13} />,    color: "emerald", max: null },
        ].map((r) => (
          <div key={r.label} className={cn("bg-card border rounded-xl p-3 space-y-2",
            r.color === "blue"    && "border-blue-500/15",
            r.color === "purple"  && "border-purple-500/15",
            r.color === "cyan"    && "border-cyan-500/15",
            r.color === "emerald" && "border-emerald-500/15",
          )}>
            <div className="flex items-center justify-between text-xs">
              <span className={cn("flex items-center gap-1.5 font-medium",
                r.color === "blue"    && "text-blue-400",
                r.color === "purple"  && "text-purple-400",
                r.color === "cyan"    && "text-cyan-400",
                r.color === "emerald" && "text-emerald-400",
              )}>{r.icon} {r.label}</span>
              <span className="font-bold text-foreground">
                {r.label === "Uptime" ? (r.value > 0 ? fmtUptime(r.value) : "—") : `${r.value.toFixed(1)}${r.unit}`}
              </span>
            </div>
            {r.max && (
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500",
                  r.value > 85 ? "bg-red-500" : r.value > 65 ? "bg-yellow-500" :
                  r.color === "blue" ? "bg-blue-500" : r.color === "purple" ? "bg-purple-500" :
                  r.color === "cyan" ? "bg-cyan-500" : "bg-emerald-500",
                )} style={{ width: `${Math.min(r.value, 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Network row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Network ↓ (Inbound)",  value: fmtBytes(stats.netRx), icon: <Wifi size={12} />, color: "text-blue-400" },
          { label: "Network ↑ (Outbound)", value: fmtBytes(stats.netTx), icon: <Wifi size={12} />, color: "text-purple-400" },
        ].map((r) => (
          <div key={r.label} className="bg-card border border-white/5 rounded-xl px-4 py-2.5 flex items-center justify-between">
            <span className={cn("flex items-center gap-1.5 text-xs", r.color)}>{r.icon} {r.label}</span>
            <span className="text-xs font-bold text-foreground font-mono">{r.value}/s</span>
          </div>
        ))}
      </div>

      {/* ── Resource Chart (PTLC style) ──────────────────────────────────── */}
      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resource Usage Chart</span>
          <span className="text-[10px] text-muted-foreground/50">Live · 2s interval</span>
        </div>
        <div className="px-2 pb-2 pt-3">
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#4b5563" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "#4b5563" }} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gCpu)" dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="mem" name="MEM" stroke="#a855f7" strokeWidth={1.5} fill="url(#gMem)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 px-4 pb-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> CPU %</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block rounded" /> Memory %</span>
        </div>
      </div>

      {/* Console */}
      <div className="bg-[#080c18] border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-1">console — {server.name}</span>
        </div>
        <div ref={consoleRef} className="h-56 overflow-y-auto p-4 font-mono text-xs space-y-0.5 scroll-smooth">
          {logs.map((line, i) => {
            const isErr = line.includes("ERROR") || line.includes("WARN");
            const isInfo = line.includes("/INFO]:");
            const isCmd = line.startsWith(">");
            return (
              <p key={i} className={cn(
                isErr ? "text-red-400" : isCmd ? "text-blue-300" : isInfo ? "text-emerald-400/80" : "text-gray-400"
              )}>{line}</p>
            );
          })}
          <p className="text-muted-foreground/30">_</p>
        </div>
        <form onSubmit={sendCmd} className="flex items-center gap-2 px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
          <ChevronRight size={14} className="text-blue-400 shrink-0" />
          <input value={cmd} onChange={(e) => setCmd(e.target.value)}
            placeholder={server.status === "running" ? "Enter command..." : "Server is offline"}
            disabled={server.status !== "running"}
            className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground/40 focus:outline-none font-mono disabled:opacity-40" />
        </form>
      </div>
    </div>
  );
}
