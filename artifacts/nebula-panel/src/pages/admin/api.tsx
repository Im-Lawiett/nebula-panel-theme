import { useState } from "react";
import { format } from "date-fns";
import { Key, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListApiKeys, useCreateApiKey, useDeleteApiKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminApi() {
  const [description, setDescription] = useState("");
  const [allowedIps, setAllowedIps] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: apiKeys = [], isLoading } = useListApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const ips = allowedIps.split('\n').map(ip => ip.trim()).filter(Boolean);

    createKey.mutate(
      { data: { description, allowedIps: ips.length > 0 ? ips : undefined } },
      {
        onSuccess: () => {
          setDescription("");
          setAllowedIps("");
          queryClient.invalidateQueries({ queryKey: ["/api/account/api-keys"] });
          toast({
            title: "Application API Key created",
            description: "Your new API key has been generated.",
          });
        }
      }
    );
  };

  const handleDeleteKey = (identifier: string) => {
    if (!confirm("Are you sure you want to delete this Application API key? It may break integrations.")) return;

    deleteKey.mutate(
      { identifier },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/account/api-keys"] });
          toast({
            title: "API Key deleted",
          });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Application API</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card/50 border-border h-fit">
          <CardHeader>
            <CardTitle>Create API Key</CardTitle>
            <CardDescription>Generate a key for external applications to control the panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Memo</Label>
                <Input 
                  id="desc" 
                  placeholder="e.g. WHMCS Integration" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ips">Allowed IPs (One per line)</Label>
                <Textarea 
                  id="ips" 
                  placeholder="Leave blank to allow any IP" 
                  value={allowedIps}
                  onChange={(e) => setAllowedIps(e.target.value)}
                  className="bg-background min-h-[100px] font-mono text-xs"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!description.trim() || createKey.isPending}
              >
                {createKey.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Key
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Configured API Keys</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 mx-4 mb-4 text-muted-foreground border border-dashed border-border rounded-lg bg-black/20">
                No application API keys have been generated.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-black/20">
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.identifier} className="hover:bg-white/5">
                      <TableCell>
                         <div className="inline-flex items-center gap-1.5 font-mono text-xs bg-black/30 px-2 py-0.5 rounded text-white border border-white/5">
                          <Key className="w-3 h-3 text-primary" /> {key.identifier}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {key.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {key.lastUsedAt ? format(new Date(key.lastUsedAt), 'MMM d, yyyy HH:mm') : 'Never'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(key.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteKey(key.identifier)}
                          disabled={deleteKey.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
