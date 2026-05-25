import { useListAdminServers } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminServers() {
  const { data: servers = [], isLoading } = useListAdminServers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Servers</h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
          Create Server
        </Button>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search servers by name or uuid..." className="pl-9 bg-background/50 border-white/10" />
            </div>
            <Button variant="outline" className="bg-background/50 border-white/10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Server Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Node</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading servers...</TableCell>
                </TableRow>
              ) : servers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No servers found.</TableCell>
                </TableRow>
              ) : (
                servers.map((server) => (
                  <TableRow key={server.id} className="hover:bg-white/5 cursor-pointer transition-colors">
                    <TableCell className="font-mono text-muted-foreground">{server.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium text-white">{server.name}</div>
                          <div className="text-xs font-mono text-muted-foreground">{server.uuid.split('-')[0]}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{server.owner}</TableCell>
                    <TableCell className="text-sm">{server.node}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground font-mono space-y-1">
                        <div>CPU: {server.cpuLimit}%</div>
                        <div>RAM: {server.memoryLimit} MB</div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                         server.status === 'suspended' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                         'bg-green-500/10 text-green-500 border border-green-500/20'
                       }`}>
                        {server.status || 'active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
