import { useState } from "react";
import { useListNodes, useCreateNode, useDeleteNode, useListLocations } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Server, HardDrive, MemoryStick, Plus, Trash2, Loader2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminNodes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", fqdn: "", locationId: 1, memory: 1024, disk: 10240, 
    memoryOverallocate: 0, diskOverallocate: 0, daemonSftp: 2022, daemonListen: 8080,
    behindProxy: false, maintenanceMode: false
  });

  const { data: nodes = [], isLoading } = useListNodes();
  const { data: locations = [] } = useListLocations();
  const createNode = useCreateNode();
  const deleteNode = useDeleteNode();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNode.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
          setIsCreateOpen(false);
          toast({ title: "Node created successfully" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this node? All servers must be removed first.")) return;
    deleteNode.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/nodes"] });
          toast({ title: "Node deleted" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nodes</h1>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Node</DialogTitle>
              <DialogDescription>Add a new daemon node to host servers.</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreate} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>FQDN / IP Address</Label>
                  <Input required value={formData.fqdn} onChange={e => setFormData({...formData, fqdn: e.target.value})} className="bg-background/50 font-mono text-sm" />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label>Location</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background"
                    value={formData.locationId}
                    onChange={e => setFormData({...formData, locationId: Number(e.target.value)})}
                  >
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.short} - {loc.long}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Total Memory (MB)</Label>
                  <Input required type="number" value={formData.memory} onChange={e => setFormData({...formData, memory: Number(e.target.value)})} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Memory Overallocation (%)</Label>
                  <Input type="number" value={formData.memoryOverallocate} onChange={e => setFormData({...formData, memoryOverallocate: Number(e.target.value)})} className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label>Total Disk Space (MB)</Label>
                  <Input required type="number" value={formData.disk} onChange={e => setFormData({...formData, disk: Number(e.target.value)})} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Disk Overallocation (%)</Label>
                  <Input type="number" value={formData.diskOverallocate} onChange={e => setFormData({...formData, diskOverallocate: Number(e.target.value)})} className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label>Daemon Port</Label>
                  <Input required type="number" value={formData.daemonListen} onChange={e => setFormData({...formData, daemonListen: Number(e.target.value)})} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Daemon SFTP Port</Label>
                  <Input required type="number" value={formData.daemonSftp} onChange={e => setFormData({...formData, daemonSftp: Number(e.target.value)})} className="bg-background/50" />
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="proxy" checked={formData.behindProxy} onCheckedChange={c => setFormData({...formData, behindProxy: c})} />
                  <Label htmlFor="proxy">Behind Proxy</Label>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="maint" checked={formData.maintenanceMode} onCheckedChange={c => setFormData({...formData, maintenanceMode: c})} />
                  <Label htmlFor="maint">Maintenance Mode</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground" disabled={createNode.isPending}>
                  {createNode.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Node
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="h-64 rounded-xl bg-card/50 animate-pulse border border-border" />
        ) : nodes.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No nodes found</h3>
            <p className="text-muted-foreground">Deploy a daemon node to start hosting servers.</p>
          </div>
        ) : (
          nodes.map(node => (
            <Card key={node.id} className="bg-card/50 border-border relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${node.status === 'online' ? 'bg-green-500' : node.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">{node.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-1">
                      <MapPin className="w-3 h-3" /> {node.location}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(node.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs font-mono text-muted-foreground truncate bg-black/20 p-1.5 rounded">{node.fqdn}</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MemoryStick className="w-3 h-3" /> RAM</span>
                      <span>{Math.round(node.usedMemory / 1024)}/{Math.round(node.totalMemory / 1024)}GB</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (node.usedMemory / node.totalMemory) * 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> Disk</span>
                      <span>{Math.round(node.usedDisk / 1024)}/{Math.round(node.totalDisk / 1024)}GB</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (node.usedDisk / node.totalDisk) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-sm">
                  <span className="text-muted-foreground">Servers Hosted</span>
                  <span className="font-semibold text-white">{node.serverCount}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
