import { useGetActivity } from "@workspace/api-client-react";
import { Activity, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const dotColor: Record<string, string> = {
  info: "bg-blue-400", success: "bg-emerald-400", warning: "bg-yellow-400", error: "bg-red-400",
};

export function ActivityTab({ serverId }: { serverId: number }) {
  const { data: logs = [], isLoading } = useGetActivity();
  const [filter, setFilter] = useState("");

  const filtered = logs.filter((l) => !filter || l.action.toLowerCase().includes(filter.toLowerCase()) || l.user.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Activity Log</h3>
        <p className="text-xs text-muted-foreground mt-0.5">All actions performed on this server</p>
      </div>

      <div className="relative">
        <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter activity..." className="w-full bg-card border border-white/8 rounded-lg pl-8 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/30 placeholder-muted-foreground/50" />
      </div>

      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-10"><Activity size={24} className="mx-auto text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No activity</p></div>
        )}
        <div className="divide-y divide-white/5">
          {filtered.map((log) => (
            <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/2 transition-colors">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", dotColor.info)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{log.action}</p>
                {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                <p className="text-xs text-muted-foreground/50 mt-0.5">by <span className="text-blue-400/80">{log.user}</span></p>
              </div>
              <p className="text-xs text-muted-foreground/40 shrink-0">{timeAgo(log.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
