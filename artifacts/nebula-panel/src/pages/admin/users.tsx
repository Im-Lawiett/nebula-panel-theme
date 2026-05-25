import { useState } from "react";
import { useListUsers, useCreateUser, useDeleteUser } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2, Loader2, Shield, ShieldBan, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useBanUser, useUnbanUser } from "@/lib/use-panel-status";

type UserWithBan = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isBanned?: boolean;
  banReason?: string;
  serverCount: number;
  createdAt: string;
};

export default function AdminUsers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<UserWithBan | null>(null);
  const [banReason, setBanReason] = useState("");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    username: "", email: "", firstName: "", lastName: "", password: "", isAdmin: false
  });

  const { data: users = [], isLoading } = useListUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const typedUsers = users as unknown as UserWithBan[];

  const filteredUsers = typedUsers.filter((u) =>
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
          toast({ title: "User berhasil dibuat" });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (id === 1) { toast({ title: "Tidak bisa hapus owner panel (ID 1)", variant: "destructive" }); return; }
    if (!confirm("Hapus user ini secara permanen?")) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        toast({ title: "User dihapus" });
      },
    });
  };

  const openBanDialog = (user: UserWithBan) => {
    setBanTarget(user);
    setBanReason("");
    setIsBanOpen(true);
  };

  const handleBan = () => {
    if (!banTarget) return;
    banUser.mutate(
      { id: banTarget.id, reason: banReason || "Banned by administrator" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
          setIsBanOpen(false);
          toast({ title: `${banTarget.username} berhasil di-ban` });
        },
        onError: (err) => {
          toast({ title: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleUnban = (user: UserWithBan) => {
    unbanUser.mutate(user.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        toast({ title: `${user.username} berhasil di-unban` });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Buat User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Buat User Baru</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Depan</Label>
                  <Input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Belakang</Label>
                  <Input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-background/50" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="admin" checked={formData.isAdmin} onCheckedChange={(c) => setFormData({ ...formData, isAdmin: c })} />
                <Label htmlFor="admin">Administrator</Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-primary text-primary-foreground" disabled={createUser.isPending}>
                  {createUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Buat
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ban Dialog */}
      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <ShieldBan className="w-5 h-5" /> Ban User: {banTarget?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              User yang di-ban tidak bisa mengakses panel sama sekali dan akan melihat pesan ban.
            </p>
            <div className="space-y-2">
              <Label>Alasan Ban</Label>
              <Textarea
                placeholder="Masukkan alasan ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="bg-background/50 border-white/10 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBanOpen(false)}>Batal</Button>
              <Button
                onClick={handleBan}
                disabled={banUser.isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {banUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldBan className="w-4 h-4 mr-2" />}
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-card/50 border-border">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <TableHead>Server</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Tidak ada user.</TableCell></TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={`hover:bg-white/5 transition-colors ${user.isBanned ? "bg-red-500/5" : ""}`}>
                    <TableCell className="font-mono text-muted-foreground">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-8 w-8 border ${user.isBanned ? "border-red-500/40" : "border-white/10"}`}>
                          <AvatarFallback className={`text-xs ${user.isBanned ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"}`}>
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            {user.username}
                            {user.id === 1 && <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-mono">OWNER</span>}
                            {user.isAdmin && user.id !== 1 && <Shield className="w-3.5 h-3.5 text-primary" />}
                            {user.isBanned && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono">BANNED</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</div>
                          {user.isBanned && user.banReason && (
                            <div className="text-xs text-red-400/70 mt-0.5">Alasan: {user.banReason}</div>
                          )}
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
                      {format(new Date(user.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.id !== 1 && (
                          user.isBanned ? (
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
                              onClick={() => handleUnban(user)}
                              title="Unban"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                              onClick={() => openBanDialog(user)}
                              title="Ban"
                            >
                              <ShieldBan className="w-4 h-4" />
                            </Button>
                          )
                        )}
                        {user.id !== 1 && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
