import { useState } from "react";
import { format } from "date-fns";
import {
  Activity, Shield, Server, Users, Settings, Key, Ban, LogIn,
  CheckCircle2, AlertCircle, Info, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LogLevel = "success" | "warning" | "info" | "error";

interface LogEntry {
  id: string;
  level: LogLevel;
  actor: string;
  action: string;
  target: string;
  ip: string;
  time: string;
}

const ALL_LOGS: LogEntry[] = [
  { id: "1",  level: "success", actor: "dilzz (ID:1)",     action: "Aktifkan Maintenance Mode",        target: "Panel Settings",           ip: "103.172.18.44", time: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "2",  level: "warning", actor: "dilzz (ID:1)",     action: "Ban user",                         target: "jelen (ID:2)",             ip: "103.172.18.44", time: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "3",  level: "success", actor: "dilzz (ID:1)",     action: "Unban user",                       target: "jelen (ID:2)",             ip: "103.172.18.44", time: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: "4",  level: "success", actor: "dilzz (ID:1)",     action: "Aktifkan Anti-Intip",              target: "Panel Settings",           ip: "103.172.18.44", time: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "5",  level: "info",    actor: "jelen (ID:2)",     action: "Login berhasil",                   target: "Panel",                    ip: "45.33.32.156",  time: new Date(Date.now() - 1.5 * 3600000).toISOString() },
  { id: "6",  level: "error",   actor: "Unknown",          action: "Login gagal (3x brute force)",     target: "Panel Login",              ip: "198.51.100.22", time: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "7",  level: "success", actor: "dilzz (ID:1)",     action: "Buat server baru",                 target: "ubotisbackunli",           ip: "103.172.18.44", time: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "8",  level: "success", actor: "pano (ID:3)",      action: "Login berhasil",                   target: "Panel",                    ip: "202.80.219.50", time: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "9",  level: "info",    actor: "dilzz (ID:1)",     action: "Ubah nama panel",                  target: "Panel Settings",           ip: "103.172.18.44", time: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "10", level: "success", actor: "dilzz (ID:1)",     action: "Tambah node baru",                 target: "node-sg2",                 ip: "103.172.18.44", time: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "11", level: "success", actor: "jelen (ID:2)",     action: "API key dibuat",                   target: "Discord Bot Key",          ip: "45.33.32.156",  time: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "12", level: "warning", actor: "dilzz (ID:1)",     action: "Hapus server",                     target: "testunli (ID:9)",          ip: "103.172.18.44", time: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: "13", level: "info",    actor: "dilzz (ID:1)",     action: "Aktifkan MOTD",                    target: "Panel Settings",           ip: "103.172.18.44", time: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: "14", level: "success", actor: "pano (ID:3)",      action: "SSH Key ditambahkan",              target: "Laptop Kerja",             ip: "202.80.219.50", time: new Date(Date.now() - 14 * 3600000).toISOString() },
  { id: "15", level: "error",   actor: "Unknown",          action: "Login gagal",                      target: "Panel Login",              ip: "203.0.113.55",  time: new Date(Date.now() - 16 * 3600000).toISOString() },
  { id: "16", level: "info",    actor: "System",           action: "Server restart otomatis",          target: "Roseeunli",                ip: "127.0.0.1",     time: new Date(Date.now() - 20 * 3600000).toISOString() },
  { id: "17", level: "success", actor: "dilzz (ID:1)",     action: "Buat akun user baru",              target: "pano (ID:3)",              ip: "103.172.18.44", time: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "18", level: "info",    actor: "jelen (ID:2)",     action: "Upload file ke server",            target: "freeunli/plugins/",        ip: "45.33.32.156",  time: new Date(Date.now() - 26 * 3600000).toISOString() },
];

const LEVEL_CONFIG = {
  success: { icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20", label: "Sukses" },
  warning: { icon: AlertCircle,  color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Peringatan" },
  info:    { icon: Info,         color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20", label: "Info" },
  error:   { icon: AlertCircle,  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20", label: "Error" },
};

const ACTION_ICON: Record<string, React.ElementType> = {
  "Login": LogIn,
  "Ban": Ban,
  "Unban": Users,
  "Maintenance": Settings,
  "Anti-Intip": Shield,
  "node": Server,
  "server": Server,
  "API": Key,
  "SSH": Shield,
  "Settings": Settings,
  "Panel": Activity,
};

function getActionIcon(action: string): React.ElementType {
  for (const [key, Icon] of Object.entries(ACTION_ICON)) {
    if (action.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Activity;
}

export default function AdminActivity() {
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = filter === "all" ? ALL_LOGS : ALL_LOGS.filter((l) => l.level === filter);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const counts = {
    all: ALL_LOGS.length,
    success: ALL_LOGS.filter((l) => l.level === "success").length,
    warning: ALL_LOGS.filter((l) => l.level === "warning").length,
    info: ALL_LOGS.filter((l) => l.level === "info").length,
    error: ALL_LOGS.filter((l) => l.level === "error").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Activity Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Semua aktivitas admin dan user di panel</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live monitoring aktif
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["all", "success", "warning", "info", "error"] as const).map((lvl) => {
          const cfg = lvl !== "all" ? LEVEL_CONFIG[lvl] : null;
          return (
            <button
              key={lvl}
              onClick={() => { setFilter(lvl); setPage(1); }}
              className={`p-3 rounded-lg border text-left transition-all ${
                filter === lvl
                  ? "bg-primary/10 border-primary/40"
                  : "bg-card/50 border-border hover:border-primary/20"
              }`}
            >
              <div className={`text-xl font-bold ${cfg ? cfg.color : "text-white"}`}>{counts[lvl]}</div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">
                {lvl === "all" ? "Semua Event" : cfg?.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Log table */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              {filter === "all" ? "Semua Log" : `Log: ${LEVEL_CONFIG[filter].label}`}
            </CardTitle>
            <CardDescription>{filtered.length} entri ditemukan</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {paginated.map((entry) => {
              const cfg = LEVEL_CONFIG[entry.level];
              const IconComponent = getActionIcon(entry.action);
              return (
                <div key={entry.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium text-white">{entry.action}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-xs text-muted-foreground font-mono bg-black/20 px-1.5 py-0.5 rounded">{entry.target}</span>
                      </div>
                      <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                        {format(new Date(entry.time), "d MMM yyyy HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground/70">
                        Oleh: <span className="text-white/70">{entry.actor}</span>
                      </span>
                      <span className="text-xs text-muted-foreground/40">·</span>
                      <span className="text-xs font-mono text-muted-foreground/50">{entry.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
              <span className="text-xs text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-border text-muted-foreground h-8 text-xs"
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-border text-muted-foreground h-8 text-xs"
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
