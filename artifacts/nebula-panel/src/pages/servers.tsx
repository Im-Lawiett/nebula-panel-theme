import { Layout } from "@/components/layout/Layout";
import { useGetServers, getGetServersQueryKey } from "@workspace/api-client-react";
import { Server, Cpu, HardDrive, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { dot: string; badge: string; label: string }> = {
  running:    { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Running" },
  stopped:    { dot: "bg-red-400",    badge: "text-red-400 bg-red-400/10 border-red-400/20",       label: "Stopped" },
  installing: { dot: "bg-yellow-400 animate-pulse", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: "Installing" },
  suspended:  { dot: "bg-orange-400", badge: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Suspended" },
};

export default function ServersPage() {
  const { data: servers, isLoading } = useGetServers({ query: { queryKey: getGetServersQueryKey() } });

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Servers</h1>
            <p className="text-sm text-muted-foreground mt-1">{servers?.length ?? 0} server(s) total</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(servers ?? []).map((srv) => {
            const s = statusStyles[srv.status] ?? statusStyles.stopped;
            return (
              <div key={srv.id} data-testid={`card-server-${srv.id}`} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/15 transition-colors">
                      <Server size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{srv.name}</h3>
                      <p className="text-xs text-muted-foreground">{srv.node}</p>
                    </div>
                  </div>
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", s.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                    {s.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="flex flex-col items-center gap-1 bg-background/50 rounded-lg py-2">
                    <Database size={14} className="text-purple-400" />
                    <span className="text-xs font-semibold text-foreground">
                      {srv.ram >= 1024 ? `${srv.ram / 1024}GB` : `${srv.ram}MB`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">RAM</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-background/50 rounded-lg py-2">
                    <Cpu size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold text-foreground">{srv.cpu}%</span>
                    <span className="text-[10px] text-muted-foreground">CPU</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-background/50 rounded-lg py-2">
                    <HardDrive size={14} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-foreground">
                      {srv.disk >= 1024 ? `${srv.disk / 1024}GB` : `${srv.disk}MB`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Disk</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Owner: <span className="text-foreground font-medium">{srv.owner}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && (servers ?? []).length === 0 && (
          <div className="text-center py-16">
            <Server size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No servers found</p>
          </div>
        )}

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground/30">
            Nebula Panel &mdash;{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/50 hover:text-blue-400 transition-colors">
              @RianModss
            </a>{" "}
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
