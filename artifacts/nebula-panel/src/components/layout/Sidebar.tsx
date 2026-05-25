import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { NebulaSvgLogo, TelegramSvg } from "./NebulaSvg";
import {
  LayoutDashboard, Server, Users, Settings, Shield,
  LogOut, ChevronRight, Zap, AlertTriangle, Network,
  ScrollText, UserPlus, ServerCog, HardDrive, Egg, MapPin, Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<"user" | "admin" | "dev">;
  badge?: string;
}

const mainNav: NavItem[] = [
  { label: "Dashboard",   href: "/",        icon: <LayoutDashboard size={17} /> },
  { label: "Servers",     href: "/servers",  icon: <Server size={17} /> },
  { label: "Users",       href: "/users",    icon: <Users size={17} />,    roles: ["admin", "dev"] },
  { label: "Nodes",       href: "/nodes",    icon: <Network size={17} />,  roles: ["admin", "dev"] },
  { label: "Audit Log",   href: "/audit",    icon: <ScrollText size={17} />, roles: ["admin", "dev"] },
  { label: "Admin Panel", href: "/admin",    icon: <Settings size={17} />, roles: ["admin", "dev"] },
];

const adminNav: NavItem[] = [
  { label: "Eggs",       href: "/admin/eggs",       icon: <Egg size={17} /> },
  { label: "Mounts",     href: "/admin/mounts",     icon: <HardDrive size={17} /> },
  { label: "Locations",  href: "/admin/locations",  icon: <MapPin size={17} /> },
];

const devNav: NavItem[] = [
  { label: "Dev Dashboard",    href: "/dev",             icon: <Zap size={17} />,           badge: "DEV" },
  { label: "Protect Features", href: "/dev/protect",     icon: <Shield size={17} /> },
  { label: "Maintenance",      href: "/dev/maintenance", icon: <AlertTriangle size={17} /> },
  { label: "Panel Settings",   href: "/settings",        icon: <Wrench size={17} /> },
];

const roleBadgeClass: Record<string, string> = {
  user:  "bg-slate-700 text-slate-300",
  admin: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  dev:   "bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-blue-200 border border-purple-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]",
};

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const logoutMutation = useLogout();

  const [panelName, setPanelName] = useState("Nebula");
  const [panelTag, setPanelTag] = useState("Panel");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: any) => {
        if (s.panelName) {
          const parts = s.panelName.trim().split(" ");
          setPanelName(parts[0] ?? "Nebula");
          setPanelTag(parts.slice(1).join(" ") || "Panel");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { logout(); navigate("/login"); },
      onError:   () => { logout(); navigate("/login"); },
    });
  };

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const visible = (items: NavItem[]) =>
    items.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const NavLink = ({ item, activeClass = "blue" }: { item: NavItem; activeClass?: "blue" | "purple" }) => {
    const active = isActive(item.href);
    const activeCls = activeClass === "purple"
      ? "bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
      : "bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-[0_0_12px_rgba(79,158,255,0.08)]";
    const iconCls = activeClass === "purple" ? "text-purple-400" : "text-blue-400";
    return (
      <Link href={item.href}>
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group",
          active ? activeCls : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}>
          <span className={cn("shrink-0 transition-colors", active ? iconCls : "text-muted-foreground group-hover:text-foreground")}>
            {item.icon}
          </span>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {item.badge}
            </span>
          )}
          {active && !item.badge && <ChevronRight size={13} className={cn("shrink-0", activeClass === "purple" ? "text-purple-400/50" : "text-blue-400/50")} />}
        </div>
      </Link>
    );
  };

  const SectionLabel = ({ label, color = "default" }: { label: string; color?: "purple" | "default" }) => (
    <p className={cn(
      "text-[10px] font-semibold uppercase tracking-widest px-3 mb-1 mt-3",
      color === "purple" ? "text-purple-400/60" : "text-muted-foreground/50"
    )}>{label}</p>
  );

  return (
    <aside className="w-60 min-h-screen flex flex-col border-r border-white/5 bg-[hsl(var(--sidebar))] shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <NebulaSvgLogo size={34} />
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md group-hover:bg-blue-500/20 transition-all" />
          </div>
          <div>
            <div className="font-bold text-base leading-none text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {panelName}
            </div>
            <div className="text-[10px] text-blue-400/70 font-medium tracking-widest uppercase mt-0.5">
              {panelTag || "Panel"}
            </div>
          </div>
        </Link>
      </div>

      {/* User badge */}
      <div className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.username[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-none">{user?.username}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", roleBadgeClass[user?.role ?? "user"])}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        <SectionLabel label="Main" />
        {visible(mainNav).map((item) => <NavLink key={item.href} item={item} />)}

        {user && (user.role === "admin" || user.role === "dev") && (
          <>
            <SectionLabel label="Quick Create" />
            <NavLink item={{ label: "New User",   href: "/users/create",   icon: <UserPlus size={17} /> }} />
            <NavLink item={{ label: "New Server", href: "/servers/create", icon: <ServerCog size={17} /> }} />

            <SectionLabel label="Admin" />
            {adminNav.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}

        {user?.role === "dev" && (
          <>
            <SectionLabel label="Dev Zone" color="purple" />
            {devNav.map((item) => <NavLink key={item.href} item={item} activeClass="purple" />)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-1">
        <NavLink item={{ label: "Profile", href: "/profile", icon: <Users size={17} /> }} />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={17} /> Logout
        </button>
        <div className="px-3 pt-2 border-t border-white/5">
          <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-blue-400/50 hover:text-blue-400 transition-colors">
            <TelegramSvg size={11} /> @RianModss
          </a>
          <p className="text-[10px] text-muted-foreground/25 mt-0.5">&copy; {new Date().getFullYear()} RianModss</p>
        </div>
      </div>
    </aside>
  );
}
