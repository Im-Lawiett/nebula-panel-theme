import { Link, useLocation, useRouter } from "wouter";
import { Search, Server, Settings, Power, User, MessageSquare, Bell } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { MotdBanner } from "@/components/motd-banner";
import { useState } from "react";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { navigate } = useRouter();
  const { currentUsername, isOwner } = useUser();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("nebula_user_id");
    localStorage.removeItem("nebula_username");
    navigate("/login");
  };

  const navLinks = [
    { href: "/", label: "Servers" },
    { href: "/chat", label: "Public Chat" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* MOTD Banner */}
      <MotdBanner />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/60 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] group-hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-shadow">
                <span className="text-primary font-bold text-xl leading-none">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">NEBULA</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_rgba(var(--primary),1)]" />
            </button>

            {/* Server list */}
            <Link href="/" className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Server className="w-5 h-5" />
            </Link>

            {/* Account */}
            <Link href="/account" className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Settings className="w-5 h-5" />
            </Link>

            {/* User badge */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-md border border-border/60 hover:border-primary/30 transition-colors">
                <div className="w-5 h-5 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium text-white">{currentUsername || "Guest"}</span>
                {isOwner && (
                  <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-1.5 py-0 rounded font-mono leading-tight">OWNER</span>
                )}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-primary hover:text-primary transition-colors rounded-md hover:bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)] ml-1"
              title="Logout"
            >
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub nav */}
        <div className="container mx-auto px-4 h-11 flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-white/5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                location === href
                  ? "text-primary border-b-2 border-primary h-full flex items-center"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
          {isOwner && (
            <Link
              href="/admin"
              className="text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-white ml-auto flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),1)]" />
              Admin Control
            </Link>
          )}
          {!isOwner && (
            <div className="ml-auto" />
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <MessageSquare className="w-3 h-3" />
            <span>Nebula Panel Theme by RianModss</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground/40">
          <span>Nebula Panel Theme — Gratis untuk semua 🎉</span>
          <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Developer: @RianModss
          </a>
        </div>
      </footer>
    </div>
  );
}
