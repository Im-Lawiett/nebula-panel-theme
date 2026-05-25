import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings, 
  Key, 
  Database, 
  MapPin, 
  Server as ServerIcon, 
  Users, 
  Shield, 
  HardDrive, 
  Layers,
  Power,
  List,
  LogOut,
  Lock
} from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navGroups = [
    {
      title: "BASIC ADMINISTRATION",
      items: [
        { name: "Overview", icon: LayoutDashboard, href: "/admin" },
        { name: "Settings", icon: Settings, href: "/admin/settings" },
        { name: "Application API", icon: Key, href: "/admin/api" },
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "Databases", icon: Database, href: "/admin/databases", locked: true },
        { name: "Locations", icon: MapPin, href: "/admin/locations" },
        { name: "Nodes", icon: ServerIcon, href: "/admin/nodes" },
        { name: "Servers", icon: ServerIcon, href: "/admin/servers" },
        { name: "Users", icon: Users, href: "/admin/users" },
        { name: "Roles", icon: Shield, href: "/admin/roles", locked: true },
      ]
    },
    {
      title: "SERVICE MANAGEMENT",
      items: [
        { name: "Mounts", icon: HardDrive, href: "/admin/mounts", locked: true },
        { name: "Nests", icon: Layers, href: "/admin/nests" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col sticky top-0 h-screen overflow-y-auto hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                <span className="text-primary font-bold text-sm leading-none">N</span>
              </div>
            <span className="font-bold tracking-tight text-white">Nebula Admin</span>
          </Link>
        </div>

        <div className="flex-1 py-4">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-6">
              <h3 className="px-6 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item, j) => {
                  const isActive = location === item.href;
                  return (
                    <Link 
                      key={j} 
                      href={item.locked ? "#" : item.href}
                      className={`flex items-center gap-3 px-6 py-2 text-sm transition-colors relative ${
                        isActive 
                          ? 'text-white bg-primary/10' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      } ${item.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                      {item.name}
                      {item.locked && <Lock className="w-3 h-3 ml-auto text-muted-foreground/50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">Admin Control</h1>
          </div>
          <div className="flex items-center gap-2">
             <Link href="/" className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <List className="w-5 h-5" />
            </Link>
            <button className="p-2 text-primary hover:text-primary transition-colors rounded-md hover:bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
              <Power className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 ml-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
