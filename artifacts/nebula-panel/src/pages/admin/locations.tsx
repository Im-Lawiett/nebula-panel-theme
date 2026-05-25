import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/lib/serverApi";
import { Layout } from "@/components/layout/Layout";
import { MapPin, Server, Network } from "lucide-react";

export default function LocationsPage() {
  const { data: locations = [], isLoading } = useQuery({ queryKey: ["locations"], queryFn: getLocations });

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-5 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <MapPin size={22} className="text-blue-400" /> Locations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Geographic locations for panel nodes</p>
        </div>

        {isLoading && <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <MapPin size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-blue-300 font-mono">{loc.short}</div>
                  <div className="text-sm font-medium text-foreground">{loc.long}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <Network size={14} className="mx-auto text-purple-400 mb-1" />
                  <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{loc.nodes}</p>
                  <p className="text-[10px] text-muted-foreground">Nodes</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <Server size={14} className="mx-auto text-blue-400 mb-1" />
                  <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{loc.servers}</p>
                  <p className="text-[10px] text-muted-foreground">Servers</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pb-2">
          <p className="text-xs text-muted-foreground/30">
            Locations &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
