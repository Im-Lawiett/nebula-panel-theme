import { useState } from "react";
import { useListUsers, useCreateUser, useDeleteUser } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Trash2, Loader2, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    username: "", email: "", firstName: "", lastName: "", password: "", isAdmin: false
  });

  const { data: users = [], isLoading } = useListUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
          setIsCreateOpen(false);
          setFormData({ username: "", email: "", firstName: "", lastName: "", password: "", isAdmin: false });
          toast({ title: "User created" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Permanently delete user?")) return;
    deleteUser.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
          toast({ title: "User deleted" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-background/50" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="admin" checked={formData.isAdmin} onCheckedChange={c => setFormData({...formData, isAdmin: c})} />
                <Label htmlFor="admin">Is Administrator</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground" disabled={createUser.isPending}>
                  {createUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-white/10" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Servers</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono text-muted-foreground">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white/10">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            {user.username}
                            {user.isAdmin && <Shield className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-black/30 border border-white/5 font-mono text-xs">
                        {user.serverCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
