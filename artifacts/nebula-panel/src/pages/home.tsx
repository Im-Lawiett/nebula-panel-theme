import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Server, MemoryStick, HardDrive, Cpu, Search, TrendingUp, TrendingDown, Play, Square, RotateCcw, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useListServers } from "@workspace/api-client-react";
import { useUser } from "@/lib/user-context";
import { usePanelStatus } from "@/lib/use-panel-status";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

function strToSeed(s: string | number): number {
  const str = String(s);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateSparkData(seed: number, base: number, points = 12) {
  const data = [];
  let v = Math.max(1, Math.min(99, base));
  for (let i = 0; i < points; i++) {
    const hash = Math.sin(seed * 9301 + i * 49297 + 233995) * 0.5 + 0.5;
    v = Math.max(2, Math.min(97, v + (hash - 0.5) * 20));
    data.push({ v: Math.round(v) });
  }
  return data;
}

function statusStyle(status: string) {
  switch (status) {
    case "running":   return { bar: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",   badge: "bg-green-500/10 text-green-400 border-green-500/30" };
    case "starting":  return { bar: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]",  badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" };
    case "stopping":  return { bar: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]", badge: "bg-orange-500/10 text-orange-400 border-orange-500/30" };
    case "stopped":   return { bar: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",     badge: "bg-red-500/10 text-red-400 border-red-500/30" };
    default:          return { bar: "bg-gray-600",                                            badge: "bg-gray-600/10 text-gray-400 border-gray-600/30" };
  }
}

function sparkColor(status: string) {
  switch (status) {
    case "running":  return "#22c55e";
    case "starting": return "#eab308";
    case "stopped":  return "#ef4444";
    default:         return "#6b7280";
  }
}

type StatusFilter = "all" | "running" | "stopped" | "starting" | "offline";
type SortKey = "name" | "status" | "node" | "ram";

const STATUS_TABS: { key: StatusFilter; label: string; color: string }[] = [
  { key: "all",      label: "Semua",    color: "text-white" },
  { key: "running",  label: "Running",  color: "text-green-400" },
  { key: "starting", label: "Starting", color: "text-yellow-400" },
  { key: "stopped",  label: "Stopped",  color: "text-red-400" },
  { key: "offline",  label: "Offline",  color: "text-gray-400" },
];

export default function Home() {
  const [showOthers, setShowOthers] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [showSort, setShowSort] = useState(false);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const { data: servers = [], isLoading } = useListServers();
  const { currentUserId, currentUsername, isOwner } = useUser();
  const { data: panelStatus } = usePanelStatus();
  const { toast } = useToast();

  const antiPeek = panelStatus?.antiPeekEnabled ?? false;

  const handleAction = (e: React.MouseEvent, serverId: string, action: "start" | "stop" | "restart", current: string) => {
    e.preventDefault();
    e.stopPropagation();
    const msgs: Record<string, { next: string; msg: string }> = {
      start:   { next: "starting", msg: "Server sedang dinyalakan..." },
      stop:    { next: "stopping", msg: "Server sedang dimatikan..." },
      restart: { next: "starting", msg: "Server sedang di-restart..." },
    };
    if (action === "start" && (current === "running" || current === "starting")) return;
    if (action === "stop" && (current === "stopped" || current === "offline")) return;
    const { next, msg } = msgs[action];
    setLocalStatus((prev) => ({ ...prev, [serverId]: next }));
    toast({ title: msg });
    setTimeout(() => {
      setLocalStatus((prev) => {
        const copy = { ...prev };
        if (action === "stop") copy[serverId] = "stopped";
        else copy[serverId] = "running";
        return copy;
      });
    }, 2500);
  };

  const visibleServers = useMemo(() => {
    let list = servers.map((s) => ({ ...s, status: localStatus[s.id] ?? s.status }));

    if (!isOwner && !showOthers) {
      list = list.filter((s) => {
        const sv = s as typeof s & { ownerUserId?: number; owner?: string };
        if (sv.ownerUserId) return sv.ownerUserId === currentUserId;
        return sv.owner?.toLowerCase() === currentUsername.toLowerCase();
      });
    }

    if (search) {
      list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }

    list.sort((a, b) => {
      switch (sortKey) {
        case "name":   return a.name.localeCompare(b.name);
        case "status": return a.status.localeCompare(b.status);
        case "node": {
          const an = (a as typeof a & { node?: string }).node ?? "";
          const bn = (b as typeof b & { node?: string }).node ?? "";
          return an.localeCompare(bn);
        }
        case "ram":    return b.memoryUsage - a.memoryUsage;
        default:       return 0;
      }
    });

    return list;
  }, [servers, isOwner, antiPeek, showOthers, search, statusFilter, sortKey, currentUserId, currentUsername, localStatus]);

  const statusCounts = useMemo(() => {
    const base = servers.map((s) => ({ ...s, status: localStatus[s.id] ?? s.status }));
    return {
      all: base.length,
      running:  base.filter((s) => s.status === "running").length,
      starting: base.filter((s) => s.status === "starting" || s.status === "stopping").length,
      stopped:  base.filter((s) => s.status === "stopped").length,
      offline:  base.filter((s) => s.status === "offline").length,
    };
  }, [servers, localStatus]);

  return (
    <div className="space-y-5">
      {/* Search + Sort + Toggle row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari server..."
            className="pl-9 bg-card/50 border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Urut: {sortKey === "name" ? "Nama" : sortKey === "status" ? "Status" : sortKey === "node" ? "Node" : "RAM"}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[120px] overflow-hidden">
                {(["name", "status", "node", "ram"] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSortKey(key); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${sortKey === key ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {key === "name" ? "Nama" : key === "status" ? "Status" : key === "node" ? "Node" : "RAM"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show others toggle */}
          {isOwner && (
            <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-md border border-border">
              <Switch id="show-others" checked={showOthers} onCheckedChange={setShowOthers} />
              <Label htmlFor="show-others" className="text-xs font-medium cursor-pointer text-muted-foreground">
                Lihat Server Lain
              </Label>
            </div>
          )}
          {antiPeek && !isOwner && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-400">
              <span>🔒 Anti-Intip Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border/40 pb-0">
        {STATUS_TABS.map((tab) => {
          const count = statusCounts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
                statusFilter === tab.key
                  ? `${tab.color} border-current`
                  : "text-muted-foreground border-transparent hover:text-white"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0 rounded-full font-mono ${
                  statusFilter === tab.key ? "bg-current/20" : "bg-white/5"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Server grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-card/50 animate-pulse border border-border" />
          ))}
        </div>
      ) : visibleServers.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
          <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">Tidak ada server</h3>
          <p className="text-muted-foreground text-sm">
            {statusFilter !== "all" ? `Tidak ada server dengan status "${statusFilter}".` : "Kamu belum punya server yang cocok."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleServers.map((server) => {
            const style = statusStyle(server.status);
            const cpuSpark = generateSparkData(strToSeed(server.id) * 7 + 1, server.cpuUsage ?? 40);
            const ramPct = server.memoryLimit > 0 ? Math.round((server.memoryUsage / server.memoryLimit) * 100) : 0;
            const trend = cpuSpark[cpuSpark.length - 1].v > cpuSpark[0].v;
            const isRunning = server.status === "running" || server.status === "starting";

            return (
              <Link key={server.id} href={`/server/${server.id}`}>
                <div className="group block bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-[0_0_20px_rgba(var(--primary),0.12)] cursor-pointer">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

                  <div className="p-5 pl-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/80 border border-border/60 flex-shrink-0">
                          <Server className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base text-white group-hover:text-primary transition-colors leading-tight truncate">{server.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{(server as typeof server & { node?: string }).node ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border ${style.badge}`}>
                          {server.status}
                        </div>
                      </div>
                    </div>

                    {/* Sparkline Chart */}
                    <div className="h-14 w-full mb-2 opacity-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cpuSpark} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                          <defs>
                            <linearGradient id={`grad-${server.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={sparkColor(server.status)} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={sparkColor(server.status)} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip
                            content={({ active, payload }) =>
                              active && payload?.length ? (
                                <div className="bg-black/80 border border-white/10 rounded px-2 py-1 text-xs text-white">CPU: {payload[0].value}%</div>
                              ) : null
                            }
                          />
                          <Area type="monotone" dataKey="v" stroke={sparkColor(server.status)} strokeWidth={1.5} fill={`url(#grad-${server.id})`} dot={false} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Quick actions (visible on hover) */}
                    <div className="flex items-center gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleAction(e, server.id, "start", server.status)}
                        disabled={isRunning}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Play className="w-3 h-3" /> Start
                      </button>
                      <button
                        onClick={(e) => handleAction(e, server.id, "stop", server.status)}
                        disabled={!isRunning}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Square className="w-3 h-3" /> Stop
                      </button>
                      <button
                        onClick={(e) => handleAction(e, server.id, "restart", server.status)}
                        disabled={!isRunning}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-3 h-3" /> Restart
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Cpu className="w-3 h-3" /> CPU
                          {trend ? <TrendingUp className="w-3 h-3 text-green-400 ml-auto" /> : <TrendingDown className="w-3 h-3 text-red-400 ml-auto" />}
                        </div>
                        <div className="font-mono text-sm font-medium">{server.cpuUsage ?? 0}%</div>
                        <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(server.cpuUsage ?? 0, 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MemoryStick className="w-3 h-3" /> RAM
                        </div>
                        <div className="font-mono text-sm font-medium">{server.memoryUsage} <span className="text-muted-foreground text-xs">/ {server.memoryLimit}MB</span></div>
                        <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${ramPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <HardDrive className="w-3 h-3" /> Disk
                        </div>
                        <div className="font-mono text-sm font-medium">{server.diskUsage} <span className="text-muted-foreground text-xs">/ {server.diskLimit}MB</span></div>
                        <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${Math.min((server.diskUsage / (server.diskLimit || 1)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
