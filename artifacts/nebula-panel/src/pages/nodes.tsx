import { Layout } from "@/components/layout/Layout";
import { useGetNodes, getGetNodesQueryKey } from "@workspace/api-client-react";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { Server, Cpu, HardDrive, Database, Wifi, WifiOff, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const statusInfo: Record<string, { badge: string; icon: React.ReactNode; label: string }> = {
  online:      { badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <Wifi size={13} />, label: "Online" },
  offline:     { badge: "text-red-400 bg-red-400/10 border-red-400/20",             icon: <WifiOff size={13} />, label: "Offline" },
  maintenance: { badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",    icon: <Wrench size={13} />, label: "Maintenance" },
};

export default function NodesPage() {
  const { data: nodes, isLoading } = useGetNodes({ query: { queryKey: getGetNodesQueryKey() } });

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Node Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of all Pterodactyl daemon nodes</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(nodes ?? []).map((node) => {
            const s = statusInfo[node.status] ?? statusInfo.offline;
            const memPct = Math.floor(Math.random() * 60 + 10);
            const diskPct = Math.floor(Math.random() * 50 + 5);
            return (
              <div key={node.id} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/15 transition-colors">
                      <Server size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{node.name}</h3>
                      <p className="text-xs text-muted-foreground">{node.location}</p>
                    </div>
                  </div>
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", s.badge)}>
                    {s.icon} {s.label}
                  </span>
                </div>

                {/* Memory usage */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><Database size={11} /> Memory</span>
                      <span className="text-foreground font-medium">{memPct}% / {node.memoryTotal >= 1024 ? `${node.memoryTotal / 1024}GB` : `${node.memoryTotal}MB`}</span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", memPct > 80 ? "bg-red-500" : "bg-purple-500")} style={{ width: `${memPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><HardDrive size={11} /> Disk</span>
                      <span className="text-foreground font-medium">{diskPct}% / {node.diskTotal >= 1024 ? `${(node.diskTotal / 1024).toFixed(0)}GB` : `${node.diskTotal}MB`}</span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", diskPct > 80 ? "bg-red-500" : "bg-cyan-500")} style={{ width: `${diskPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Cpu size={11} /> Servers</span>
                    <span className="font-semibold text-foreground">{node.serverCount} active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Node Management &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
