import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import { Settings, RefreshCw, Pencil, AlertTriangle } from "lucide-react";

interface Server { id: number; name: string; node: string; owner: string; }

export function SettingsTab({ server }: { server: Server }) {
  const { toast } = useToast();
  const [newName, setNewName] = useState(server.name);
  const [confirming, setConfirming] = useState(false);

  const renameMut = useMutation({
    mutationFn: async () => {
      const token = getAuthToken?.();
      const res = await fetch(`/api/servers/${server.id}/settings/rename`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => toast({ title: "Server renamed (refresh to see changes)" }),
  });

  const reinstallMut = useMutation({
    mutationFn: async () => {
      const token = getAuthToken?.();
      const res = await fetch(`/api/servers/${server.id}/settings/reinstall`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => { setConfirming(false); toast({ title: "Reinstall initiated" }); },
  });

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Server Settings</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Manage core settings for this server</p>
      </div>

      {/* Server info */}
      <div className="bg-card border border-white/5 rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Settings size={14} className="text-blue-400" /> Server Information</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Server ID", value: `#${server.id}` },
            { label: "Node", value: server.node },
            { label: "Owner", value: server.owner },
            { label: "Status", value: "Active" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rename */}
      <div className="bg-card border border-white/5 rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Pencil size={14} className="text-blue-400" /> Rename Server</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/40 transition-all"
          />
          <button
            onClick={() => renameMut.mutate()}
            disabled={renameMut.isPending || newName === server.name}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {renameMut.isPending ? "Saving..." : "Rename"}
          </button>
        </div>
      </div>

      {/* Reinstall */}
      <div className="bg-card border border-red-500/15 rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2"><AlertTriangle size={14} className="text-red-400" /> Reinstall Server</p>
        <p className="text-xs text-muted-foreground mb-4">This will stop the server and reinstall it using the egg's install script. <strong className="text-red-400">All server files may be deleted!</strong></p>

        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-semibold rounded-lg transition-all flex items-center gap-2">
            <RefreshCw size={13} /> Reinstall Server
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-300 font-medium">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => reinstallMut.mutate()} disabled={reinstallMut.isPending} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50">
                {reinstallMut.isPending ? "Reinstalling..." : "Yes, Reinstall"}
              </button>
              <button onClick={() => setConfirming(false)} className="px-4 py-2 border border-white/10 text-muted-foreground text-sm rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
