import { useState, useRef, useEffect } from "react";
import { useServerPower, getGetServerQueryKey, getGetServersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw, Zap, ChevronRight, Database, Cpu, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface Server { id: number; name: string; status: string; owner: string; node: string; ram: number; cpu: number; disk: number; }

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

export function ConsoleTab({ server }: { server: Server }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const powerMutation = useServerPower();
  const [cmd, setCmd] = useState("");
  const [logs, setLogs] = useState<string[]>(server.status === "running" ? LOG_LINES : ["Server is offline. Start it to see console output."]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const info = statusInfo[server.status] ?? statusInfo.stopped;

  useEffect(() => { consoleRef.current?.scrollTo(0, consoleRef.current.scrollHeight); }, [logs]);

  const sendPower = (action: "start" | "stop" | "restart" | "kill") => {
    powerMutation.mutate({ id: server.id, data: { action } }, {
      onSuccess: (updated: any) => {
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

  const ramPct = server.status === "running" ? 42 : 0;
  const cpuPct = server.status === "running" ? 18 : 0;
  const diskPct = 24;

  return (
    <div className="p-6 space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", info.badge)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} /> {info.label}
          </span>
          <span className="text-xs text-muted-foreground">{server.node}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { action: "start"   as const, label: "Start",   cls: "text-emerald-400 border-emerald-500/30 bg-emerald-600/15 hover:bg-emerald-600/25", icon: <Play size={12} />, disabled: server.status === "running" },
            { action: "stop"    as const, label: "Stop",    cls: "text-red-400 border-red-500/30 bg-red-600/15 hover:bg-red-600/25",                 icon: <Square size={12} />, disabled: server.status === "stopped" },
            { action: "restart" as const, label: "Restart", cls: "text-blue-400 border-blue-500/30 bg-blue-600/15 hover:bg-blue-600/25",             icon: <RotateCcw size={12} />, disabled: false },
            { action: "kill"    as const, label: "Kill",    cls: "text-orange-400 border-orange-500/30 bg-orange-600/15 hover:bg-orange-600/25",     icon: <Zap size={12} />, disabled: false },
          ].map((b) => (
            <button key={b.action} onClick={() => sendPower(b.action)} disabled={b.disabled || powerMutation.isPending}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30", b.cls)}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource bars */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "CPU", value: cpuPct, max: 100, unit: "%", icon: <Cpu size={12} />, color: "blue" },
          { label: "Memory", value: ramPct, max: 100, unit: "%", icon: <Database size={12} />, color: "purple" },
          { label: "Disk", value: diskPct, max: 100, unit: "%", icon: <HardDrive size={12} />, color: "cyan" },
        ].map((r) => (
          <div key={r.label} className="bg-card border border-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground flex items-center gap-1">{r.icon} {r.label}</span>
              <span className="font-semibold text-foreground">{r.value}{r.unit}</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", r.value > 80 ? "bg-red-500" : r.value > 60 ? "bg-yellow-500" : `bg-${r.color}-500`)} style={{ width: `${r.value}%` }} />
            </div>
          </div>
        ))}
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
        <div ref={consoleRef} className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-0.5 scroll-smooth">
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
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder={server.status === "running" ? "Enter command..." : "Server is offline"}
            disabled={server.status !== "running"}
            className="flex-1 bg-transparent text-xs text-foreground placeholder-muted-foreground/40 focus:outline-none font-mono disabled:opacity-40"
          />
        </form>
      </div>
    </div>
  );
}
