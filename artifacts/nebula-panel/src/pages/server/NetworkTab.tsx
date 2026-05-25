import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllocations, setPrimaryAllocation, deleteAllocation } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Network, Star, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["allocations", serverId];

  const { data: allocs = [], isLoading } = useQuery({ queryKey: key, queryFn: () => getAllocations(serverId) });
  const setPrimaryMut = useMutation({ mutationFn: (id: number) => setPrimaryAllocation(serverId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Primary allocation updated" }); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteAllocation(serverId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Allocation removed" }); } });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!" }); };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Network</h3>
        <p className="text-xs text-muted-foreground mt-0.5">IP address and port allocations for this server</p>
      </div>

      {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!isLoading && allocs.length === 0 && (
        <div className="text-center py-12 bg-card border border-white/5 rounded-xl">
          <Network size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No allocations assigned</p>
        </div>
      )}

      <div className="space-y-2">
        {allocs.map((a) => (
          <div key={a.id} className={cn("bg-card border rounded-xl p-4 flex items-center gap-4 transition-all", a.primary ? "border-blue-500/30" : "border-white/5 hover:border-white/10")}>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-mono text-sm font-semibold text-foreground">
                  {a.ip === "0.0.0.0" ? "0.0.0.0" : a.ip}:{a.port}
                </p>
                {a.primary && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-300 bg-blue-500/15 border border-blue-500/25 rounded-full px-2 py-0.5">
                    <Star size={9} /> Primary
                  </span>
                )}
                {a.alias && <span className="text-xs text-muted-foreground/60 font-mono">{a.alias}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => copy(`${a.ip}:${a.port}`)} className="p-1.5 text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/20 rounded-lg transition-all" title="Copy">
                <Copy size={13} />
              </button>
              {!a.primary && (
                <button onClick={() => setPrimaryMut.mutate(a.id)} className="p-1.5 text-muted-foreground hover:text-blue-400 border border-white/8 hover:border-blue-500/30 rounded-lg transition-all" title="Set as primary">
                  <Star size={13} />
                </button>
              )}
              {!a.primary && (
                <button onClick={() => deleteMut.mutate(a.id)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 text-xs text-blue-300/80 leading-relaxed">
        <p className="font-semibold text-blue-300 mb-1">Connection Information</p>
        {allocs.filter((a) => a.primary).map((a) => (
          <p key={a.id}>Connect your game client to: <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">{a.ip === "0.0.0.0" ? "your-server-ip" : a.ip}:{a.port}</span></p>
        ))}
      </div>
    </div>
  );
}
