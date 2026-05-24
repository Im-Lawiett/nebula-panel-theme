import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { NebulaSvgLogo, TelegramSvg } from "./NebulaSvg";
import {
  LayoutDashboard, Server, Users, Settings, Shield, Wrench,
  LogOut, ChevronRight, Zap, AlertTriangle, Network,
  ScrollText, UserPlus, ServerCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<"user" | "admin" | "dev">;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard",   href: "/",        icon: <LayoutDashboard size={18} /> },
  { label: "Servers",     href: "/servers",  icon: <Server size={18} /> },
  { label: "Users",       href: "/users",    icon: <Users size={18} />,    roles: ["admin", "dev"] },
  { label: "Nodes",       href: "/nodes",    icon: <Network size={18} />,  roles: ["admin", "dev"] },
  { label: "Audit Log",   href: "/audit",    icon: <ScrollText size={18} />, roles: ["admin", "dev"] },
  { label: "Admin Panel", href: "/admin",    icon: <Settings size={18} />, roles: ["admin", "dev"] },
];

const devNavItems: NavItem[] = [
  { label: "Dev Dashboard",    href: "/dev",              icon: <Zap size={18} />,          badge: "DEV" },
  { label: "Protect Features", href: "/dev/protect",      icon: <Shield size={18} /> },
  { label: "Maintenance",      href: "/dev/maintenance",  icon: <AlertTriangle size={18} /> },
];

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { logout(); navigate("/login"); },
      onError:   () => { logout(); navigate("/login"); },
    });
  };

  const visibleItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const roleBadgeClass: Record<string, string> = {
    user:  "bg-slate-700 text-slate-300",
    admin: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
    dev:   "bg-gradient-to-r from-purple-900/80 to-blue-900/80 text-blue-200 border border-purple-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]",
  };

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/5 bg-[hsl(var(--sidebar))]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <NebulaSvgLogo size={36} />
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md group-hover:bg-blue-500/20 transition-all" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Nebula
            </div>
            <div className="text-xs text-blue-400/70 font-medium tracking-widest uppercase">Panel</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/5 mx-2 mt-2 rounded-lg bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.username[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider", roleBadgeClass[user?.role ?? "user"])}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Navigation</p>

        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group",
                active
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-[0_0_12px_rgba(79,158,255,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}>
                <span className={cn("transition-colors", active ? "text-blue-400" : "text-muted-foreground group-hover:text-foreground")}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-blue-400/50" />}
              </div>
            </Link>
          );
        })}

        {/* Quick actions for admin+ */}
        {user && (user.role === "admin" || user.role === "dev") && (
          <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mt-4 mb-2">Quick Create</p>
            <Link href="/users/create">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group",
                isActive("/users/create") ? "bg-blue-500/15 text-blue-300 border border-blue-500/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}>
                <UserPlus size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>New User</span>
              </div>
            </Link>
            <Link href="/servers/create">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group",
                isActive("/servers/create") ? "bg-blue-500/15 text-blue-300 border border-blue-500/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}>
                <ServerCog size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>New Server</span>
              </div>
            </Link>
          </>
        )}

        {user?.role === "dev" && (
          <>
            <p className="text-[10px] font-semibold text-purple-400/70 uppercase tracking-widest px-3 mt-4 mb-2">Dev Zone</p>
            {devNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group",
                    active
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-[0_0_12px_rgba(139,92,246,0.1)]"
                      : "text-muted-foreground hover:text-purple-300/80 hover:bg-purple-500/5"
                  )}>
                    <span className={cn("transition-colors", active ? "text-purple-400" : "text-muted-foreground group-hover:text-purple-400")}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <div className="px-3 pt-2 border-t border-white/5">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">Nebula Panel Theme</p>
          <a
            href="https://t.me/RianModss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors mt-0.5"
          >
            <TelegramSvg size={11} />
            <span>@RianModss</span>
          </a>
          <p className="text-[10px] text-muted-foreground/30 mt-0.5">
            &copy; {new Date().getFullYear()} RianModss
          </p>
        </div>
      </div>
    </aside>
  );
}
