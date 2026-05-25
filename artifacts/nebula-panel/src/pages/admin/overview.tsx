import { Server, Users, Activity, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";

export default function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 rounded-xl bg-card/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border hover:border-primary/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Server className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stats.totalServers}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Servers</h3>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-green-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stats.activeServers}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Servers</h3>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-blue-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</h3>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-purple-500/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stats.totalNodes}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Nodes</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-primary" /> Resource Allocation (RAM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated / Total</span>
                <span className="font-mono">{Math.round(stats.usedRam / 1024)}GB / {Math.round(stats.totalRam / 1024)}GB</span>
              </div>
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (stats.usedRam / stats.totalRam) * 100)}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-500" /> Storage Allocation (Disk)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Allocated / Total</span>
                <span className="font-mono">{Math.round(stats.usedDisk / 1024)}GB / {Math.round(stats.totalDisk / 1024)}GB</span>
              </div>
              <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (stats.usedDisk / stats.totalDisk) * 100)}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
