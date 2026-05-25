import { useState } from "react";
import { Link } from "wouter";
import { Server, MemoryStick, HardDrive, Cpu, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useListServers } from "@workspace/api-client-react";

export default function Home() {
  const [showOthers, setShowOthers] = useState(false);
  const [search, setSearch] = useState("");
  
  const { data: servers = [], isLoading } = useListServers();

  const filteredServers = servers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search servers..." 
            className="pl-9 bg-card/50 border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-card px-4 py-2 rounded-md border border-border">
          <Switch id="show-others" checked={showOthers} onCheckedChange={setShowOthers} />
          <Label htmlFor="show-others" className="text-sm font-medium cursor-pointer">SHOWING OTHERS' SERVERS</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-card/50 animate-pulse border border-border" />
          ))}
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
          <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">No servers found</h3>
          <p className="text-muted-foreground">You don't have any servers matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServers.map((server) => {
            const isRunning = server.status === 'running';
            
            return (
              <Link key={server.id} href={`/server/${server.id}`}>
                <div className="group block bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-[0_0_20px_rgba(var(--primary),0.15)] cursor-pointer">
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isRunning ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
                  
                  <div className="p-5 pl-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-secondary`}>
                          <Server className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">{server.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{server.node}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${isRunning ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {server.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Cpu className="w-3.5 h-3.5" /> CPU
                        </div>
                        <div className="font-mono text-sm">{server.cpuUsage}%</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <MemoryStick className="w-3.5 h-3.5" /> RAM
                        </div>
                        <div className="font-mono text-sm">{server.memoryUsage} / {server.memoryLimit}MB</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <HardDrive className="w-3.5 h-3.5" /> Disk
                        </div>
                        <div className="font-mono text-sm">{server.diskUsage} / {server.diskLimit}MB</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
