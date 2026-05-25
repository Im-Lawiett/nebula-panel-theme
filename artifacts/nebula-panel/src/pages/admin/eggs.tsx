import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEggs } from "@/lib/serverApi";
import { Layout } from "@/components/layout/Layout";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { Egg, Search, ChevronRight, Terminal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nestColors: Record<string, string> = {
  "Minecraft":      "blue",
  "Source Engine":  "orange",
  "Rust":           "amber",
  "Voice Servers":  "purple",
  "Discord Bots":   "indigo",
};

const colorClass: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
};

export default function EggsPage() {
  const { data: eggs = [], isLoading } = useQuery({ queryKey: ["eggs"], queryFn: getEggs });
  const [search, setSearch] = useState("");
  const [activeNest, setActiveNest] = useState<string>("all");

  const nests = Array.from(new Set(eggs.map((e) => e.nestName)));
  const filtered = eggs.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchNest = activeNest === "all" || e.nestName === activeNest;
    return matchSearch && matchNest;
  });

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Egg size={22} className="text-blue-400" /> Eggs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Server software configurations (Pterodactyl Eggs)</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
            {eggs.length} eggs across {nests.length} nests
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search eggs..."
              className="w-full bg-card border border-white/8 rounded-lg pl-8 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/30"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["all", ...nests].map((n) => (
              <button key={n} onClick={() => setActiveNest(n)} className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeNest === n ? "bg-blue-600 text-white" : "bg-card border border-white/8 text-muted-foreground hover:text-foreground hover:border-white/20"
              )}>
                {n === "all" ? "All" : n}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((egg) => {
            const color = colorClass[nestColors[egg.nestName] ?? "blue"];
            return (
              <div key={egg.id} className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", color.bg)}>
                      <Egg size={18} className={color.text} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{egg.name}</h3>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", color.bg, color.text, color.border)}>
                        {egg.nestName}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground/50">#{egg.id}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{egg.description}</p>
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-start gap-2">
                    <Terminal size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                    <code className="text-[10px] font-mono text-muted-foreground leading-relaxed break-all">{egg.startupCommand.slice(0, 80)}{egg.startupCommand.length > 80 ? "..." : ""}</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <Code2 size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                    <code className="text-[10px] font-mono text-muted-foreground break-all">{egg.dockerImage}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pb-2">
          <p className="text-xs text-muted-foreground/30">
            Eggs &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
