import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useCreateServer, getGetServersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Server, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_LIST = ["Node-SG01", "Node-US01", "Node-EU01", "Node-AU01"];

export default function CreateServerPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const createServer = useCreateServer();

  const [form, setForm] = useState({ name: "", owner: "", node: "Node-SG01", ram: "1024", cpu: "100", disk: "10240" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServer.mutate({
      data: {
        name: form.name, owner: form.owner, node: form.node,
        ram: parseInt(form.ram), cpu: parseInt(form.cpu), disk: parseInt(form.disk),
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetServersQueryKey() });
        toast({ title: `Server "${form.name}" is being created...` });
        navigate("/servers");
      },
      onError: (err: any) => toast({ title: err?.data?.error ?? "Failed to create server", variant: "destructive" }),
    });
  };

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <button onClick={() => navigate("/servers")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Servers
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Server size={22} className="text-blue-400" /> Create Server
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Provision a new server on a node</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
          {[
            { label: "Server Name", key: "name", type: "text", placeholder: "Game-01" },
            { label: "Owner Username", key: "owner", type: "text", placeholder: "playerone" },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/40 transition-all"
                required
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Node</label>
            <select
              value={form.node}
              onChange={set("node")}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/40 transition-all"
            >
              {NODE_LIST.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "RAM (MB)", key: "ram", placeholder: "1024" },
              { label: "CPU (%)", key: "cpu", placeholder: "100" },
              { label: "Disk (MB)", key: "disk", placeholder: "10240" },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  type="number"
                  value={(form as any)[f.key]}
                  onChange={set(f.key)}
                  placeholder={f.placeholder}
                  min="1"
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/40 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => navigate("/servers")} className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createServer.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {createServer.isPending ? "Creating..." : "Create Server"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/30">
            &copy; {new Date().getFullYear()} RianModss &mdash;{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
