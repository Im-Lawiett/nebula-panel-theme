/**
 * Public demo page — shows a static preview of the panel UI.
 * Used for screenshots / onboarding. No auth required.
 */
import { Link } from "wouter";
import { NebulaSvgLogo } from "@/components/layout/NebulaSvg";
import {
  LayoutDashboard, Server, Users, Network, Settings, ScrollText,
  Play, Square, Zap, ChevronRight, ServerCog, UserPlus,
  Egg, HardDrive, MapPin, Shield, AlertTriangle, LogOut,
  Cpu, Database, Activity, ShieldAlert, ArrowRight, Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVERS = [
  { id: 1, name: "Survival SMP",    owner: "playerone", node: "Node-SG01", egg: "Paper",    status: "running",  ram: 4096, cpu: 200, disk: 20480 },
  { id: 2, name: "Creative World",  owner: "playerone", node: "Node-US01", egg: "Vanilla",   status: "stopped",  ram: 2048, cpu: 100, disk: 10240 },
  { id: 3, name: "Dev Test Server", owner: "dev",       node: "Node-EU01", egg: "Node.js",   status: "running",  ram: 8192, cpu: 400, disk: 51200 },
  { id: 4, name: "Admin Monitor",   owner: "admin",     node: "Node-SG01", egg: "Python",    status: "stopped",  ram: 1024, cpu: 50,  disk: 5120  },
  { id: 5, name: "CS2 Competitive", owner: "playerone", node: "Node-US01", egg: "CS2",       status: "running",  ram: 4096, cpu: 300, disk: 30720 },
];

const STATUS_CLS: Record<string, string> = {
  running:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  stopped:    "text-red-400 bg-red-400/10 border-red-400/20",
  installing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  suspended:  "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

const STATUS_DOT: Record<string, string> = {
  running:    "bg-emerald-400 animate-pulse",
  stopped:    "bg-red-400",
  installing: "bg-yellow-400 animate-pulse",
  suspended:  "bg-orange-400",
};

const NAV = [
  { label: "Dashboard",   href: "#", icon: <LayoutDashboard size={17} />, active: true },
  { label: "Servers",     href: "#", icon: <Server size={17} /> },
  { label: "Users",       href: "#", icon: <Users size={17} /> },
  { label: "Nodes",       href: "#", icon: <Network size={17} /> },
  { label: "Audit Log",   href: "#", icon: <ScrollText size={17} /> },
  { label: "Admin Panel", href: "#", icon: <Settings size={17} /> },
];

const QUICK = [
  { label: "New User",   icon: <UserPlus size={17} /> },
  { label: "New Server", icon: <ServerCog size={17} /> },
];

const ADMIN_NAV = [
  { label: "Eggs",      icon: <Egg size={17} /> },
  { label: "Mounts",    icon: <HardDrive size={17} /> },
  { label: "Locations", icon: <MapPin size={17} /> },
];

const DEV_NAV = [
  { label: "Dev Dashboard",    icon: <Zap size={17} />,           badge: "DEV" },
  { label: "Protect Features", icon: <Shield size={17} /> },
  { label: "Maintenance",      icon: <AlertTriangle size={17} /> },
  { label: "Panel Settings",   icon: <Wrench size={17} /> },
];

const ACTIVITY = [
  { id: 1, action: "Server started",  user: "playerone", details: "Server 'Survival SMP' started",   time: "1h ago" },
  { id: 2, action: "User login",      user: "admin",     details: "Logged in from 192.168.1.1",       time: "2h ago" },
  { id: 3, action: "Server created",  user: "dev",       details: "Created server 'Dev Test Server'", time: "1d ago" },
  { id: 4, action: "Server stopped",  user: "playerone", details: "Creative World stopped",           time: "2d ago" },
  { id: 5, action: "User banned",     user: "admin",     details: "Banned user 'troll2024'",          time: "3d ago" },
];

function SidebarSection({ label, color = "default" }: { label: string; color?: "purple" | "default" }) {
  return (
    <p className={cn("text-[10px] font-semibold uppercase tracking-widest px-3 mb-1 mt-3",
      color === "purple" ? "text-purple-400/60" : "text-muted-foreground/50"
    )}>{label}</p>
  );
}

function NavItem({ item, activeClass = "blue" }: { item: any; activeClass?: "blue" | "purple" }) {
  const activeCls = activeClass === "purple"
    ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
    : "bg-blue-500/15 text-blue-300 border border-blue-500/20";
  const iconCls = activeClass === "purple" ? "text-purple-400" : "text-blue-400";
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
      item.active ? activeCls : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}>
      <span className={cn("shrink-0", item.active ? iconCls : "text-muted-foreground")}>{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">{item.badge}</span>}
      {item.active && !item.badge && <ChevronRight size={13} className={cn("shrink-0", activeClass === "purple" ? "text-purple-400/50" : "text-blue-400/50")} />}
    </div>
  );
}

export default function DemoPage() {
  const STATS = [
    { label: "Total Users",    value: 3,  icon: <Users size={20} className="text-blue-400" />,    color: "border-blue-500/10" },
    { label: "Total Servers",  value: 5,  icon: <Server size={20} className="text-purple-400" />, color: "border-purple-500/10" },
    { label: "Active Servers", value: 3,  icon: <Play size={20} className="text-emerald-400" />,  color: "border-emerald-500/10" },
    { label: "Banned Users",   value: 0,  icon: <ShieldAlert size={20} className="text-red-400" />,color: "border-red-500/10" },
    { label: "Admins",         value: 1,  icon: <Users size={20} className="text-amber-400" />,   color: "border-amber-500/10" },
    { label: "Devs",           value: 1,  icon: <Zap size={20} className="text-cyan-400" />,      color: "border-cyan-500/10" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-60 min-h-screen flex flex-col border-r border-white/5 bg-[hsl(222,47%,8%)] shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <NebulaSvgLogo size={34} />
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md" />
            </div>
            <div>
              <div className="font-bold text-base leading-none text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Nebula</div>
              <div className="text-[10px] text-blue-400/70 font-medium tracking-widest uppercase mt-0.5">Panel</div>
            </div>
          </div>
        </div>

        {/* User badge */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">D</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate leading-none">dev</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">dev@nebula.local</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-blue-200 border border-purple-500/50">dev</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          <SidebarSection label="Main" />
          {NAV.map((item) => <NavItem key={item.label} item={item} />)}

          <SidebarSection label="Quick Create" />
          {QUICK.map((item) => <NavItem key={item.label} item={item} />)}

          <SidebarSection label="Admin" />
          {ADMIN_NAV.map((item) => <NavItem key={item.label} item={item} />)}

          <SidebarSection label="Dev Zone" color="purple" />
          {DEV_NAV.map((item) => <NavItem key={item.label} item={{ ...item, active: false }} activeClass="purple" />)}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 cursor-pointer">
            <LogOut size={17} /> Logout
          </div>
          <div className="px-3 pt-2 border-t border-white/5">
            <p className="text-[10px] text-blue-400/50">@RianModss</p>
            <p className="text-[10px] text-muted-foreground/25 mt-0.5">&copy; 2026 RianModss</p>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Welcome back, <span className="text-blue-400">dev</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Here's what's happening in your panel</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/50 bg-card border border-white/5 rounded-lg px-3 py-2">
              <span>Nebula Panel by <span className="text-blue-400/70">@RianModss</span></span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className={cn("bg-card border rounded-xl p-5 flex items-center gap-4", s.color)}>
                <div className="p-3 rounded-lg bg-white/5 shrink-0">{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server list */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Servers</h2>
                <span className="text-xs text-blue-400">View all</span>
              </div>
              <div className="space-y-3">
                {SERVERS.slice(0, 4).map((srv) => (
                  <div key={srv.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[srv.status])} />
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">{srv.name}</p>
                        <p className="text-xs text-muted-foreground">{srv.owner} · {srv.node} · {srv.egg}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize", STATUS_CLS[srv.status])}>
                        {srv.status}
                      </span>
                      <ArrowRight size={13} className="text-muted-foreground/40 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-blue-400" />
                <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {ACTIVITY.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{log.user}</p>
                      <p className="text-[10px] text-muted-foreground/50">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Server Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>All Servers</h2>
              <span className="text-xs text-blue-400">5 servers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {SERVERS.map((srv) => (
                <div key={srv.id} className="bg-card border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
                        <Server size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm group-hover:text-blue-400 transition-colors">{srv.name}</p>
                        <p className="text-xs text-muted-foreground">{srv.egg}</p>
                      </div>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border capitalize flex items-center gap-1", STATUS_CLS[srv.status])}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[srv.status])} />
                      {srv.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "RAM", val: srv.ram, max: 8192, unit: "MB", icon: <Database size={11} />, color: "blue" },
                      { label: "CPU", val: srv.cpu, max: 400,  unit: "%",  icon: <Cpu size={11} />,      color: "purple" },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className={cn("text-[10px] w-8", r.color === "blue" ? "text-blue-400" : "text-purple-400")}>{r.label}</span>
                        <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", r.color === "blue" ? "bg-blue-500" : "bg-purple-500")}
                            style={{ width: `${Math.min(r.val / r.max * 100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-14 text-right">{r.val} {r.unit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{srv.owner} · {srv.node}</p>
                    <span className="text-xs text-blue-400/60 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      Manage <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
