import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDatabases, createDatabase, deleteDatabase, rotatePassword } from "@/lib/serverApi";
import type { Database } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Database as DbIcon, Plus, Trash2, RefreshCw, Eye, EyeOff, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function DatabasesTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["databases", serverId];

  const { data: dbs = [], isLoading } = useQuery({ queryKey: key, queryFn: () => getDatabases(serverId) });
  const createMut = useMutation({ mutationFn: (name: string) => createDatabase(serverId, name), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setNewName(""); setShowing(false); toast({ title: "Database created" }); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteDatabase(serverId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Database deleted" }); } });
  const rotateMut = useMutation({ mutationFn: (id: number) => rotatePassword(serverId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Password rotated" }); } });

  const [newName, setNewName] = useState("");
  const [showing, setShowing] = useState(false);
  const [revealedPw, setRevealedPw] = useState<Set<number>>(new Set());

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Databases</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage MySQL databases for this server</p>
        </div>
        <button onClick={() => setShowing(!showing)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
          <Plus size={13} /> New Database
        </button>
      </div>

      {showing && (
        <form onSubmit={(e) => { e.preventDefault(); if (newName) createMut.mutate(newName); }} className="bg-card border border-blue-500/20 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Create Database</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-0 flex-1 bg-background border border-white/10 rounded-lg overflow-hidden">
              <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-white/10 whitespace-nowrap">s{serverId}_</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="database_name" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none" required />
            </div>
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50">
              {createMut.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!isLoading && dbs.length === 0 && (
        <div className="text-center py-12 bg-card border border-white/5 rounded-xl">
          <DbIcon size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No databases created yet</p>
        </div>
      )}

      <div className="space-y-3">
        {dbs.map((db) => {
          const revealed = revealedPw.has(db.id);
          return (
            <div key={db.id} className="bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><DbIcon size={16} className="text-blue-400" /></div>
                  <div>
                    <p className="font-semibold text-sm text-foreground font-mono">{db.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Created {new Date(db.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => rotateMut.mutate(db.id)} className="p-1.5 text-muted-foreground hover:text-blue-400 border border-white/8 hover:border-blue-500/30 rounded-lg transition-all" title="Rotate password">
                    <RefreshCw size={13} />
                  </button>
                  <button onClick={() => { const s = new Set(revealedPw); revealed ? s.delete(db.id) : s.add(db.id); setRevealedPw(s); }} className="p-1.5 text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/20 rounded-lg transition-all">
                    {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => deleteMut.mutate(db.id)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Host", value: `${db.host}:${db.port}` },
                  { label: "Username", value: db.username },
                  { label: "Database", value: db.name },
                  { label: "Password", value: revealed ? db.password : "••••••••••••" },
                ].map((f) => (
                  <div key={f.label} className="bg-background/50 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-mono text-foreground truncate">{f.value}</p>
                      {f.label === "Password" && revealed && (
                        <button onClick={() => { navigator.clipboard.writeText(f.value); toast({ title: "Copied!" }); }} className="shrink-0"><Copy size={10} className="text-muted-foreground hover:text-foreground" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
