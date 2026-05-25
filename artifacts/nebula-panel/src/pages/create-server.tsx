import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useCreateServer, useGetNodes, getGetServersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Server, ArrowLeft, Cpu, HardDrive, MemoryStick, Egg, Network, FileText, User, Database, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const EGGS: Record<string, { nest: string; image: string; startup: string }> = {
  "Paper":   { nest: "Minecraft Java",    image: "ghcr.io/pterodactyl/yolks:java_17",       startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar" },
  "Purpur":  { nest: "Minecraft Java",    image: "ghcr.io/pterodactyl/yolks:java_17",       startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar purpur.jar" },
  "Forge":   { nest: "Minecraft Java",    image: "ghcr.io/pterodactyl/yolks:java_17",       startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar forge.jar" },
  "Vanilla": { nest: "Minecraft Java",    image: "ghcr.io/pterodactyl/yolks:java_17",       startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar server.jar" },
  "Bedrock": { nest: "Minecraft Bedrock", image: "ghcr.io/pterodactyl/yolks:bedrock",       startup: "./bedrock_server" },
  "Node.js": { nest: "Bots & Apps",       image: "ghcr.io/pterodactyl/yolks:nodejs_18",     startup: "node {{BOT_JS_FILE}}" },
  "Python":  { nest: "Bots & Apps",       image: "ghcr.io/pterodactyl/yolks:python_3.11",   startup: "python {{PY_FILE}}" },
  "CS2":     { nest: "Source Engine",     image: "ghcr.io/pterodactyl/yolks:steamcmd",      startup: "./srcds_run -game csgo +sv_lan 0" },
  "Rust":    { nest: "Custom Games",      image: "ghcr.io/pterodactyl/yolks:steamcmd",      startup: "./RustDedicated -batchmode" },
};

const NESTS = Object.entries(
  Object.entries(EGGS).reduce<Record<string, string[]>>((acc, [egg, v]) => {
    (acc[v.nest] = acc[v.nest] ?? []).push(egg);
    return acc;
  }, {}),
);

const ALLOCATIONS = [
  "0.0.0.0:25565","0.0.0.0:25566","0.0.0.0:25567","0.0.0.0:25568",
  "0.0.0.0:27015","0.0.0.0:27016","0.0.0.0:3000","0.0.0.0:8000",
  "0.0.0.0:8080","0.0.0.0:5000","0.0.0.0:4000","0.0.0.0:6000",
];

const inputCls = "w-full bg-background/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-white/5">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CreateServerPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const createServer = useCreateServer();
  const { data: nodes } = useGetNodes({ query: { queryKey: ["nodes"] } });

  const [form, setForm] = useState({
    name: "", description: "", owner: "", node: "",
    egg: "Paper",
    allocation: "0.0.0.0:25565",
    dockerImage: EGGS["Paper"]!.image,
    startupCommand: EGGS["Paper"]!.startup,
    ram: "1024", cpu: "100", disk: "10240",
    databases: "0", backups: "3",
  });

  useEffect(() => {
    if (nodes && (nodes as any[]).length > 0 && !form.node) {
      const online = (nodes as any[]).find((n: any) => n.status === "online");
      if (online) setForm((f) => ({ ...f, node: online.name }));
    }
  }, [nodes]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleEggChange = (eggName: string) => {
    const egg = EGGS[eggName];
    setForm((f) => ({
      ...f, egg: eggName,
      dockerImage: egg?.image ?? f.dockerImage,
      startupCommand: egg?.startup ?? f.startupCommand,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast({ title: "Server name is required", variant: "destructive" }); return; }
    if (!form.node) { toast({ title: "Please select a node", variant: "destructive" }); return; }

    createServer.mutate({
      data: {
        name: form.name.trim(),
        description: form.description,
        ownerUsername: form.owner.trim() || undefined,
        node: form.node,
        egg: form.egg,
        dockerImage: form.dockerImage,
        startupCommand: form.startupCommand,
        allocation: form.allocation,
        ram: parseInt(form.ram) || 1024,
        cpu: parseInt(form.cpu) || 100,
        disk: parseInt(form.disk) || 10240,
        databases: parseInt(form.databases) || 0,
        backups: parseInt(form.backups) || 3,
      } as any,
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetServersQueryKey() });
        toast({ title: `✅ Server "${form.name}" is being created`, description: "Status will change to stopped when done." });
        navigate("/servers");
      },
      onError: (err: any) => toast({ title: err?.data?.error ?? "Failed to create server", variant: "destructive" }),
    });
  };

  const onlineNodes = (nodes as any[] | undefined)?.filter((n: any) => n.status === "online") ?? [];
  const offlineNodes = (nodes as any[] | undefined)?.filter((n: any) => n.status !== "online") ?? [];

  const ramGB = form.ram ? Math.round(parseInt(form.ram) / 1024 * 10) / 10 : 0;
  const diskGB = form.disk ? Math.round(parseInt(form.disk) / 1024 * 10) / 10 : 0;

  return (
    <Layout requireRole="admin">
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/servers")}
            className="p-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Server size={20} className="text-blue-400" /> Create New Server
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Deploy a server instance on a node</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Core Details */}
          <SectionCard icon={<FileText size={15} />} title="Core Details" subtitle="Basic server information">
            <Field label="Server Name" hint="required">
              <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. Survival SMP" className={inputCls} required />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={set("description")} placeholder="What is this server for?" rows={2}
                className={`${inputCls} resize-none`} />
            </Field>
          </SectionCard>

          {/* Owner */}
          <SectionCard icon={<User size={15} />} title="Server Owner" subtitle="Who owns this server">
            <Field label="Owner Username" hint="blank = you">
              <input type="text" value={form.owner} onChange={set("owner")} placeholder="playerone" className={inputCls} />
            </Field>
          </SectionCard>

          {/* Node & Allocation */}
          <SectionCard icon={<Network size={15} />} title="Node & Allocation" subtitle="Where this server will run">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Node" hint="required">
                <select value={form.node} onChange={set("node")} className={selectCls} required>
                  <option value="" disabled>Select node...</option>
                  {onlineNodes.map((n: any) => <option key={n.name} value={n.name}>{n.name} — {n.location}</option>)}
                  {offlineNodes.map((n: any) => <option key={n.name} value={n.name} disabled>{n.name} ({n.status})</option>)}
                </select>
              </Field>
              <Field label="Allocation (IP:Port)">
                <select value={form.allocation} onChange={set("allocation")} className={selectCls}>
                  {ALLOCATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
            </div>
          </SectionCard>

          {/* Egg */}
          <SectionCard icon={<Egg size={15} />} title="Egg Configuration" subtitle="Software running on this server">
            <Field label="Egg">
              <select value={form.egg} onChange={(e) => handleEggChange(e.target.value)} className={selectCls}>
                {NESTS.map(([nest, eggs]) => (
                  <optgroup key={nest} label={`── ${nest}`}>
                    {eggs.map((egg) => <option key={egg} value={egg}>{egg}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Docker Image" hint="auto-filled">
              <input type="text" value={form.dockerImage} onChange={set("dockerImage")} className={inputCls} />
            </Field>
            <Field label="Startup Command" hint="auto-filled">
              <input type="text" value={form.startupCommand} onChange={set("startupCommand")} className={inputCls} />
            </Field>
          </SectionCard>

          {/* Resources */}
          <SectionCard icon={<Cpu size={15} />} title="Resource Limits" subtitle="Hardware allocated to this server">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "ram",  label: "Memory (MB)", icon: <MemoryStick size={12} />, color: "text-blue-400" },
                { key: "cpu",  label: "CPU (%)",      icon: <Cpu size={12} />,         color: "text-purple-400" },
                { key: "disk", label: "Disk (MB)",    icon: <HardDrive size={12} />,   color: "text-cyan-400" },
              ].map((f) => (
                <Field key={f.key} label={f.label}>
                  <div className="relative">
                    <span className={cn("absolute left-3 top-1/2 -translate-y-1/2", f.color)}>{f.icon}</span>
                    <input type="number" min="1" value={(form as any)[f.key]} onChange={set(f.key)} className={`${inputCls} pl-8`} />
                  </div>
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "databases", label: "Databases",  icon: <Database size={12} />, color: "text-amber-400" },
                { key: "backups",   label: "Backups",    icon: <Archive size={12} />,  color: "text-emerald-400" },
              ].map((f) => (
                <Field key={f.key} label={f.label}>
                  <div className="relative">
                    <span className={cn("absolute left-3 top-1/2 -translate-y-1/2", f.color)}>{f.icon}</span>
                    <input type="number" min="0" value={(form as any)[f.key]} onChange={set(f.key)} className={`${inputCls} pl-8`} />
                  </div>
                </Field>
              ))}
            </div>
            {/* Preview badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: `${ramGB} GB RAM`, color: "blue" },
                { label: `${form.cpu}% CPU`, color: "purple" },
                { label: `${diskGB} GB Disk`, color: "cyan" },
                { label: `${form.databases} DB`, color: "amber" },
                { label: `${form.backups} Backups`, color: "emerald" },
              ].map((b) => (
                <span key={b.label} className={cn(
                  "text-[11px] font-semibold px-2.5 py-1 rounded-full border",
                  b.color === "blue"    && "text-blue-400 bg-blue-500/10 border-blue-500/20",
                  b.color === "purple"  && "text-purple-400 bg-purple-500/10 border-purple-500/20",
                  b.color === "cyan"    && "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                  b.color === "amber"   && "text-amber-400 bg-amber-500/10 border-amber-500/20",
                  b.color === "emerald" && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                )}>{b.label}</span>
              ))}
            </div>
          </SectionCard>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => navigate("/servers")}
              className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={createServer.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              <Server size={15} />
              {createServer.isPending ? "Creating..." : "Create Server"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
