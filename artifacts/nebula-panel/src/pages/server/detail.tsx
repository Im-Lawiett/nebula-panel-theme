import { useParams } from "wouter";
import { Terminal, Folder, Database as DatabaseIcon, CalendarClock, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useGetServer, getGetServerQueryKey } from "@workspace/api-client-react";

export default function ServerDetail() {
  const params = useParams();
  const serverId = params.id || "";
  
  const { data: server, isLoading } = useGetServer(serverId, {
    query: { enabled: !!serverId, queryKey: getGetServerQueryKey(serverId) }
  });

  if (isLoading || !server) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-card/50 rounded-xl border border-border"></div>
        <div className="h-96 bg-card/50 rounded-xl border border-border"></div>
      </div>
    );
  }

  const isRunning = server.status === 'running';

  return (
    <div className="space-y-6">
      {/* Server Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card rounded-xl border border-border relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isRunning ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'}`} />
        
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {server.name}
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${isRunning ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {server.status}
            </span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded">{server.ip}:{server.port}</span>
            <span>{server.node}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-background/50 border-white/10 hover:bg-white/5 hover:text-white">Restart</Button>
          <Button variant="outline" className="bg-background/50 border-white/10 hover:bg-white/5 hover:text-white">Stop</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] border-0">Start</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="console" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="console" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Terminal className="w-4 h-4 mr-2" /> Console</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Folder className="w-4 h-4 mr-2" /> Files</TabsTrigger>
          <TabsTrigger value="databases" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><DatabaseIcon className="w-4 h-4 mr-2" /> Databases</TabsTrigger>
          <TabsTrigger value="schedules" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><CalendarClock className="w-4 h-4 mr-2" /> Schedules</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Settings className="w-4 h-4 mr-2" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-[#0c0c0c] border-[#1e1e1e] overflow-hidden rounded-xl shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e1e] bg-[#111]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">server@nebula:~</span>
                </div>
                <CardContent className="p-4 h-[500px] overflow-y-auto font-mono text-sm">
                  <div className="text-green-400 mb-1">[Pterodactyl Daemon]: Checking server status...</div>
                  <div className="text-green-400 mb-1">[Pterodactyl Daemon]: Server is running</div>
                  <div className="text-blue-400 mb-1">Loading libraries, please wait...</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Starting minecraft server version 1.20.4</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Loading properties</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Default game type: SURVIVAL</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Generating keypair</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Starting Minecraft server on *:25565</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Using default channel type</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Preparing level "world"</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Preparing start region for dimension minecraft:overworld</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Time elapsed: 1455 ms</div>
                  <div className="text-white mb-1">[Server thread/INFO]: Done (2.123s)! For help, type "help"</div>
                  <div className="flex items-center mt-2 text-white">
                    <span className="mr-2">&gt;</span>
                    <span className="w-2 h-4 bg-primary/80 animate-pulse"></span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-card/50 border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> CPU Load</span>
                      <span className="font-mono text-white">{server.cpuUsage}%</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${server.cpuUsage}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Memory</span>
                      <span className="font-mono text-white">{server.memoryUsage} / {server.memoryLimit} MB</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (server.memoryUsage / server.memoryLimit) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5"><DatabaseIcon className="w-3.5 h-3.5" /> Disk</span>
                      <span className="font-mono text-white">{server.diskUsage} / {server.diskLimit} MB</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (server.diskUsage / server.diskLimit) * 100)}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card className="bg-card/50 border-border">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Folder className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">File Manager</h3>
              <p className="text-muted-foreground max-w-md mb-6">Manage your server files directly from the browser. Upload, download, edit, and compress files.</p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={`/server/${server.id}/files`}>Go to File Manager</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {["databases", "schedules", "settings"].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card className="bg-card/50 border-border">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Settings className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2 capitalize">{tab}</h3>
                <p className="text-muted-foreground">This feature is not fully implemented in the current demo.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
