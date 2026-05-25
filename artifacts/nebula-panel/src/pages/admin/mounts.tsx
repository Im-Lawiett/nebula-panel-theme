import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMounts, createMount, deleteMount } from "@/lib/serverApi";
import type { Mount } from "@/lib/serverApi";
import { Layout } from "@/components/layout/Layout";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { HardDrive, Plus, Trash2, Lock, Unlock, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function MountsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["admin-mounts"];

  const { data: mounts = [], isLoading } = useQuery({ queryKey: key, queryFn: getMounts });
  const createMut = useMutation({
    mutationFn: createMount,
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setShowing(false); setForm(defaultForm); toast({ title: "Mount created" }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteMount(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Mount deleted" }); },
  });

  const defaultForm: Omit<Mount, "id" | "servers"> = { name: "", description: "", source: "", target: "", readOnly: false, userMountable: false };
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [showing, setShowing] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <HardDrive size={22} className="text-blue-400" /> Mounts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Bind mounts available to attach to servers</p>
          </div>
          <button onClick={() => setShowing(!showing)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all">
            <Plus size={14} /> New Mount
          </button>
        </div>

        {showing && (
          <form
            onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}
            className="bg-card border border-blue-500/20 rounded-xl p-5 space-y-4"
          >
            <p className="font-semibold text-foreground">Create Mount</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", key: "name", placeholder: "Shared Plugins" },
                { label: "Source Path", key: "source", placeholder: "/mnt/shared/plugins" },
                { label: "Target Path", key: "target", placeholder: "/home/container/plugins" },
              ].map((f) => (
                <div key={f.key} className={cn("space-y-1.5", f.key === "name" ? "col-span-2" : "")}>
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={set(f.key)} placeholder={f.placeholder} required
                    className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-blue-500/40" />
                </div>
              ))}
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input value={form.description} onChange={set("description")} placeholder="Optional description"
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/40" />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={form.readOnly} onChange={(e) => setForm((f) => ({ ...f, readOnly: e.target.checked }))} className="accent-blue-500" />
                Read-only
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={form.userMountable} onChange={(e) => setForm((f) => ({ ...f, userMountable: e.target.checked }))} className="accent-blue-500" />
                User Mountable
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {createMut.isPending ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={() => setShowing(false)} className="px-4 py-2 border border-white/10 text-muted-foreground text-sm rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {isLoading && <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

        <div className="space-y-3">
          {mounts.map((m) => (
            <div key={m.id} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <HardDrive size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{m.name}</h3>
                      {m.readOnly && (
                        <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5"><Lock size={9} /> Read-only</span>
                      )}
                      {m.userMountable && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5"><Unlock size={9} /> User Mountable</span>
                      )}
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Server size={12} /> {m.servers} servers</span>
                  <button onClick={() => deleteMut.mutate(m.id)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all ml-2">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Source</p>
                  <code className="text-xs font-mono text-foreground">{m.source}</code>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Target</p>
                  <code className="text-xs font-mono text-foreground">{m.target}</code>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pb-2">
          <p className="text-xs text-muted-foreground/30">
            Mounts &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
