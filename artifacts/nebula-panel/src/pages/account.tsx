import { useState } from "react";
import { format } from "date-fns";
import { Key, Plus, Trash2, Shield, Activity, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListApiKeys, useCreateApiKey, useDeleteApiKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Account() {
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
            title: "API Key created",
            description: "Your new API key has been generated.",
          });
        }
      }
    );
  };

  const handleDeleteKey = (identifier: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    deleteKey.mutate(
      { identifier },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/account/api-keys"] });
          toast({
            title: "API Key deleted",
            description: "The API key has been revoked.",
          });
        }
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="account" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><User className="w-4 h-4 mr-2" /> Account</TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Key className="w-4 h-4 mr-2" /> API Credentials</TabsTrigger>
          <TabsTrigger value="ssh" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Shield className="w-4 h-4 mr-2" /> SSH Keys</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Activity className="w-4 h-4 mr-2" /> Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Update your personal information and email.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Account settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-card/50 border-border h-fit">
              <CardHeader>
                <CardTitle>Create API Key</CardTitle>
                <CardDescription>Generate a new key to access the application API.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input 
                      id="desc" 
                      placeholder="e.g. Discord Bot" 
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
                <CardTitle>Existing API Keys</CardTitle>
                <CardDescription>Manage your active API credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-black/20">
                    No API keys have been generated.
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow>
                          <TableHead>Identifier</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.identifier}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {key.identifier}
                            </TableCell>
                            <TableCell className="font-medium">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ssh">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle>SSH Keys</CardTitle>
              <CardDescription>Manage SSH keys for SFTP access.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">SSH key management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Recent login and security events.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Activity logs coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
