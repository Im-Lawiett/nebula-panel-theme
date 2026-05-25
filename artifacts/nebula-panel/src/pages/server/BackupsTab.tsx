import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBackups, createBackup, deleteBackup, restoreBackup, toggleBackupLock } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Archive, Plus, Trash2, RotateCcw, Lock, Unlock, CheckCircle, XCircle, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  if (!bytes) return "—";
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function BackupsTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["backups", serverId];

  const { data: backups = [], isLoading } = useQuery({ queryKey: key, queryFn: () => getBackups(serverId), refetchInterval: (q) => (q.state.data ?? []).some((b) => !b.completedAt) ? 3000 : false });
  const createMut = useMutation({ mutationFn: ({ name, locked }: { name: string; locked: boolean }) => createBackup(serverId, name, locked), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setName(""); setShowing(false); toast({ title: "Backup started" }); } });
  const deleteMut = useMutation({ mutationFn: (uuid: string) => deleteBackup(serverId, uuid), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Backup deleted" }); } });
  const restoreMut = useMutation({ mutationFn: (uuid: string) => restoreBackup(serverId, uuid), onSuccess: () => toast({ title: "Restore queued" }) });
  const lockMut = useMutation({ mutationFn: (uuid: string) => toggleBackupLock(serverId, uuid), onSuccess: () => qc.invalidateQueries({ queryKey: key }) });

  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);
  const [showing, setShowing] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Backups</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{backups.length} backup{backups.length !== 1 ? "s" : ""} stored</p>
        </div>
        <button onClick={() => setShowing(!showing)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
          <Plus size={13} /> Create Backup
        </button>
      </div>

      {showing && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ name, locked }); }} className="bg-card border border-blue-500/20 rounded-xl p-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Backup name (optional)" className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/40" />
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="accent-blue-500" />
            Lock this backup (prevent deletion)
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50">
              {createMut.isPending ? "Creating..." : "Create Backup"}
            </button>
            <button type="button" onClick={() => setShowing(false)} className="px-4 py-2 border border-white/10 text-muted-foreground text-sm rounded-lg hover:border-white/20">Cancel</button>
          </div>
        </form>
      )}

      {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!isLoading && backups.length === 0 && (
        <div className="text-center py-12 bg-card border border-white/5 rounded-xl">
          <Archive size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No backups yet</p>
        </div>
      )}

      <div className="space-y-2">
        {backups.map((b) => (
          <div key={b.uuid} className="bg-card border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all">
            <div className="shrink-0">
              {!b.completedAt ? <Loader size={18} className="text-yellow-400 animate-spin" /> : b.successful ? <CheckCircle size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{timeAgo(b.createdAt)}</span>
                <span className="text-xs text-muted-foreground">{formatSize(b.size)}</span>
                {b.locked && <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5"><Lock size={10} /> Locked</span>}
                {!b.completedAt && <span className="text-[10px] text-yellow-400">In progress...</span>}
              </div>
            </div>
            {b.completedAt && b.successful && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => lockMut.mutate(b.uuid)} className={cn("p-1.5 border rounded-lg transition-all text-muted-foreground hover:text-yellow-400 border-white/8 hover:border-yellow-500/30")} title={b.locked ? "Unlock" : "Lock"}>
                  {b.locked ? <Unlock size={13} /> : <Lock size={13} />}
                </button>
                <button onClick={() => restoreMut.mutate(b.uuid)} className="p-1.5 text-muted-foreground hover:text-blue-400 border border-white/8 hover:border-blue-500/30 rounded-lg transition-all" title="Restore">
                  <RotateCcw size={13} />
                </button>
                {!b.locked && (
                  <button onClick={() => deleteMut.mutate(b.uuid)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
