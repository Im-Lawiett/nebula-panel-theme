import { Link, useLocation } from "wouter";
import { Search, Server, Settings, Power } from "lucide-react";

export function UserLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                <span className="text-primary font-bold text-xl leading-none">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">NEBULA</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/" className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Server className="w-5 h-5" />
            </Link>
            <Link href="/account" className="p-2 text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-white/5">
              <Settings className="w-5 h-5" />
            </Link>
            <button className="p-2 text-primary hover:text-primary transition-colors rounded-md hover:bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)] ml-2">
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-white/5">
          <Link href="/" className={`text-sm font-medium whitespace-nowrap transition-colors ${location === '/' ? 'text-primary border-b-2 border-primary h-full flex items-center' : 'text-muted-foreground hover:text-white'}`}>
            Servers
          </Link>
          <Link href="/chat" className={`text-sm font-medium whitespace-nowrap transition-colors ${location === '/chat' ? 'text-primary border-b-2 border-primary h-full flex items-center' : 'text-muted-foreground hover:text-white'}`}>
            Public Chat
          </Link>
          <Link href="/admin" className="text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-white ml-auto">
            Admin Control
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
