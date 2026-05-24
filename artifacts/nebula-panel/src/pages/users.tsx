import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  useGetUsers, useBanUser, useUnbanUser, useDeleteUser, useUpdateUser,
  getGetUsersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, Ban, Check, Trash2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const roleBadge: Record<string, string> = {
  user: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  admin: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  dev: "text-purple-300 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/30 shadow-[0_0_8px_rgba(139,92,246,0.2)]",
};

export default function UsersPage() {
  const { data: users, isLoading } = useGetUsers({ query: { queryKey: getGetUsersQueryKey() } });
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [banTarget, setBanTarget] = useState<{ id: number; username: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [editTarget, setEditTarget] = useState<{ id: number; role: string } | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });

  const handleBan = () => {
    if (!banTarget || !banReason.trim()) return;
    banUser.mutate({ id: banTarget.id, data: { reason: banReason } }, {
      onSuccess: () => { toast({ title: `${banTarget.username} banned` }); setBanTarget(null); setBanReason(""); invalidate(); },
      onError: () => toast({ title: "Failed to ban user", variant: "destructive" }),
    });
  };

  const handleUnban = (id: number, username: string) => {
    unbanUser.mutate({ id }, {
      onSuccess: () => { toast({ title: `${username} unbanned` }); invalidate(); },
      onError: () => toast({ title: "Failed to unban", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number, username: string) => {
    if (!confirm(`Delete user ${username}?`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => { toast({ title: `${username} deleted` }); invalidate(); },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const handleRoleChange = (id: number, role: string) => {
    updateUser.mutate({ id, data: { role: role as any } }, {
      onSuccess: () => { toast({ title: "Role updated" }); setEditTarget(null); invalidate(); },
      onError: () => toast({ title: "Failed to update role", variant: "destructive" }),
    });
  };

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{users?.length ?? 0} registered user(s)</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-background/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} data-testid={`row-user-${u.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    {editTarget?.id === u.id ? (
                      <select
                        value={editTarget.role}
                        onChange={(e) => setEditTarget({ id: u.id, role: e.target.value })}
                        onBlur={() => handleRoleChange(u.id, editTarget.role)}
                        className="bg-background border border-white/10 rounded px-2 py-1 text-xs text-foreground"
                        autoFocus
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="dev">dev</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditTarget({ id: u.id, role: u.role })}
                        className={cn("text-xs font-medium px-2 py-0.5 rounded-full border hover:opacity-80 transition-opacity capitalize", roleBadge[u.role])}
                      >
                        {u.role}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <Ban size={12} /> Banned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.isBanned ? (
                        <button
                          data-testid={`button-unban-${u.id}`}
                          onClick={() => handleUnban(u.id, u.username)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-emerald-400/10 transition-colors"
                        >
                          <Check size={13} /> Unban
                        </button>
                      ) : (
                        <button
                          data-testid={`button-ban-${u.id}`}
                          onClick={() => { setBanTarget({ id: u.id, username: u.username }); setBanReason(""); }}
                          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-400/10 transition-colors"
                        >
                          <Ban size={13} /> Ban
                        </button>
                      )}
                      <button
                        data-testid={`button-delete-${u.id}`}
                        onClick={() => handleDelete(u.id, u.username)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ban modal */}
        {banTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Ban size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ban User</h3>
                  <p className="text-sm text-muted-foreground">Banning: {banTarget.username}</p>
                </div>
              </div>
              <input
                data-testid="input-ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-red-500/40 mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setBanTarget(null)} className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  data-testid="button-confirm-ban"
                  onClick={handleBan}
                  disabled={!banReason.trim() || banUser.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {banUser.isPending ? "Banning..." : "Confirm Ban"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            &copy; {new Date().getFullYear()} RianModss &mdash; <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
