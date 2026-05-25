import { Server, Users, Activity, HardDrive, Cpu, MemoryStick, TrendingUp, Zap, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";

const SERVER_STATUS_DATA = [
  { name: "Running",  value: 5, color: "#22c55e" },
  { name: "Stopped",  value: 2, color: "#ef4444" },
  { name: "Starting", value: 1, color: "#eab308" },
];

function buildWeekData() {
  const days = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
  return days.map((day, i) => ({
    day,
    requests: 400 + Math.round(Math.sin(i * 1.3 + 0.5) * 150 + Math.random() * 100),
    errors: Math.max(0, Math.round(Math.sin(i * 0.9 + 1) * 10 + Math.random() * 8)),
  }));
}
const WEEK_DATA = buildWeekData();

function buildNodeData() {
  return [
    { node: "node-nyk1", cpu: 42, ram: 78, disk: 55 },
    { node: "node-sg1",  cpu: 28, ram: 45, disk: 30 },
    { node: "node-nyk2", cpu: 15, ram: 33, disk: 20 },
  ];
}
const NODE_DATA = buildNodeData();

export default function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-card/50 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  const ramPct = Math.min(100, Math.round((stats.usedRam / stats.totalRam) * 100));
  const diskPct = Math.min(100, Math.round((stats.usedDisk / stats.totalDisk) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Semua sistem normal
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Server className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalServers}</span>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Server</h3>
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {stats.activeServers} aktif saat ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-green-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.activeServers}</span>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Server Aktif</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalServers - stats.activeServers} server tidak aktif
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total User</h3>
            <p className="text-xs text-muted-foreground mt-1">Terdaftar di panel</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border hover:border-purple-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalNodes}</span>
            </div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Node</h3>
            <p className="text-xs text-muted-foreground mt-1">Daemon terhubung</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity line chart */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Aktivitas Panel (7 hari terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEK_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradErr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "white" }}
                  />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradReq)" dot={false} />
                  <Area type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={1.5} fill="url(#gradErr)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status pie chart */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Status Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SERVER_STATUS_DATA} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {SERVER_STATUS_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource + Node status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-primary" /> Alokasi Resource
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1"><MemoryStick className="w-3.5 h-3.5" /> RAM</span>
                <span className="font-mono text-xs">{Math.round(stats.usedRam / 1024)}GB / {Math.round(stats.totalRam / 1024)}GB</span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all" style={{ width: `${ramPct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{ramPct}% terpakai</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Disk</span>
                <span className="font-mono text-xs">{Math.round(stats.usedDisk / 1024)}GB / {Math.round(stats.totalDisk / 1024)}GB</span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${diskPct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{diskPct}% terpakai</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" /> Status Node
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {NODE_DATA.map((node) => (
              <div key={node.node} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 w-24 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,1)]" />
                  <span className="text-xs font-mono text-white">{node.node}</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {[
                    { label: "CPU", value: node.cpu, color: "bg-cyan-500" },
                    { label: "RAM", value: node.ram, color: "bg-primary" },
                    { label: "Disk", value: node.disk, color: "bg-purple-500" },
                  ].map((res) => (
                    <div key={res.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{res.label}</span>
                        <span className="font-mono">{res.value}%</span>
                      </div>
                      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className={`h-full ${res.color} rounded-full`} style={{ width: `${res.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
