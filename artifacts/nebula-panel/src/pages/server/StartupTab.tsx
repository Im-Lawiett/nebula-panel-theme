import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStartup, updateVariable } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Play, Save } from "lucide-react";

export function StartupTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["startup", serverId];

  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => getStartup(serverId) });
  const updateMut = useMutation({
    mutationFn: ({ key: k, value }: { key: string; value: string }) => updateVariable(serverId, k, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Variable updated" }); },
  });

  const [vals, setVals] = useState<Record<string, string>>({});

  if (isLoading) return <div className="p-6 flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Startup Configuration</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Configure server startup command and environment variables</p>
      </div>

      {/* Startup command */}
      <div className="bg-card border border-white/5 rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Startup Command</p>
        <div className="bg-[#080c18] border border-white/8 rounded-lg p-4">
          <code className="text-xs font-mono text-emerald-400/90 leading-relaxed break-all">{data?.startup}</code>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Variables shown in <span className="font-mono text-blue-400">{"{{"} double braces {"}}"}</span> are replaced with the values below.</p>
      </div>

      {/* Variables */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Environment Variables</p>
        {(data?.variables ?? []).map((v) => (
          <div key={v.envVariable} className="bg-card border border-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
              </div>
              <span className="font-mono text-xs text-blue-400/80 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5">{v.envVariable}</span>
            </div>
            {v.isEditable ? (
              <div className="flex gap-2">
                <input
                  value={vals[v.envVariable] ?? v.serverValue}
                  onChange={(e) => setVals((x) => ({ ...x, [v.envVariable]: e.target.value }))}
                  placeholder={v.defaultValue}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-blue-500/40 transition-all"
                />
                <button
                  onClick={() => updateMut.mutate({ key: v.envVariable, value: vals[v.envVariable] ?? v.serverValue })}
                  disabled={updateMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  <Save size={12} /> Save
                </button>
              </div>
            ) : (
              <div className="bg-background/50 border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground">{v.serverValue} <span className="text-xs text-muted-foreground/40 ml-2">(read-only)</span></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
