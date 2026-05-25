import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubusers, createSubuser, deleteSubuser } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Trash2, ShieldCheck } from "lucide-react";

const ALL_PERMISSIONS = [
  "control.console", "control.start", "control.stop", "control.restart",
  "file.read", "file.read-content", "file.create", "file.update", "file.delete",
  "database.read", "database.create", "database.delete", "database.view_password",
  "backup.read", "backup.create", "backup.delete", "backup.restore",
  "schedule.read", "schedule.create", "schedule.update", "schedule.delete",
  "allocation.read", "startup.read", "startup.update",
  "settings.read", "settings.rename", "settings.reinstall",
  "user.read", "user.create", "user.update", "user.delete",
  "activity.read",
];

export function SubusersTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["subusers", serverId];

  const { data: users = [], isLoading } = useQuery({ queryKey: key, queryFn: () => getSubusers(serverId) });
  const createMut = useMutation({ mutationFn: ({ email, perms }: { email: string; perms: string[] }) => createSubuser(serverId, email, perms), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setShowing(false); setEmail(""); setPerms(new Set()); toast({ title: "Subuser invited" }); } });
  const deleteMut = useMutation({ mutationFn: (uuid: string) => deleteSubuser(serverId, uuid), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Subuser removed" }); } });

  const [showing, setShowing] = useState(false);
  const [email, setEmail] = useState("");
  const [perms, setPerms] = useState<Set<string>>(new Set(["control.console", "control.start", "control.stop", "file.read", "file.read-content"]));

  const toggle = (p: string) => { const s = new Set(perms); s.has(p) ? s.delete(p) : s.add(p); setPerms(s); };
  const selectAll = () => setPerms(new Set(ALL_PERMISSIONS));
  const clearAll = () => setPerms(new Set());

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Subusers</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Grant other users access to this server</p>
        </div>
        <button onClick={() => setShowing(!showing)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
          <Plus size={13} /> Add Subuser
        </button>
      </div>

      {showing && (
        <div className="bg-card border border-blue-500/20 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Invite Subuser</p>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="user@example.com" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/40" required />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-blue-400 hover:text-blue-300">Select all</button>
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {ALL_PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/3 cursor-pointer text-xs text-foreground">
                  <input type="checkbox" checked={perms.has(p)} onChange={() => toggle(p)} className="accent-blue-500 w-3 h-3" />
                  <span className="font-mono text-muted-foreground truncate">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMut.mutate({ email, perms: Array.from(perms) })} disabled={!email || createMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
              {createMut.isPending ? "Inviting..." : "Send Invite"}
            </button>
            <button onClick={() => setShowing(false)} className="px-4 py-2 border border-white/10 text-muted-foreground text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!isLoading && users.length === 0 && (
        <div className="text-center py-12 bg-card border border-white/5 rounded-xl">
          <Users size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No subusers added yet</p>
        </div>
      )}

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.uuid} className="bg-card border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {u.username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{u.username}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">{u.permissions.length} permission{u.permissions.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => deleteMut.mutate(u.uuid)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
