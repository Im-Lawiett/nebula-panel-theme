import { Layout } from "@/components/layout/Layout";
import { useGetActivity, getGetActivityQueryKey } from "@workspace/api-client-react";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { Activity, Filter, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getActionType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("ban") || a.includes("delete") || a.includes("remov")) return "destructive";
  if (a.includes("creat") || a.includes("add") || a.includes("regist")) return "success";
  if (a.includes("mainten") || a.includes("protect") || a.includes("toggle")) return "warning";
  return "info";
}

const actionDot: Record<string, string> = {
  destructive: "bg-red-400",
  success:     "bg-emerald-400",
  warning:     "bg-yellow-400",
  info:        "bg-blue-400",
};

export default function AuditLogPage() {
  const { data: activity, isLoading, isFetching } = useGetActivity({ query: { queryKey: getGetActivityQueryKey() } });
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");

  const filtered = (activity ?? []).filter(
    (log) => !filter || log.action.toLowerCase().includes(filter.toLowerCase()) || log.user.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Activity size={22} className="text-blue-400" /> Audit Log
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Full history of all panel actions</p>
          </div>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: getGetActivityQueryKey() })}
            className={cn("p-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all", isFetching && "animate-spin")}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by action or user..."
            className="w-full bg-card border border-white/8 rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/40 transition-all"
          />
        </div>

        {/* Log list */}
        <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12">
              <Activity size={32} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No activity logs found</p>
            </div>
          )}

          <div className="divide-y divide-white/5">
            {filtered.map((log) => {
              const type = getActionType(log.action);
              return (
                <div key={log.id} data-testid={`item-log-${log.id}`} className="px-5 py-4 hover:bg-white/2 transition-colors flex items-start gap-4">
                  <div className="mt-1.5 shrink-0">
                    <div className={cn("w-2 h-2 rounded-full", actionDot[type])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{log.details}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground/60">by <span className="text-blue-400/80">{log.user}</span></span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground/50">{timeAgo(log.timestamp)}</p>
                    <p className="text-[10px] text-muted-foreground/30 mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Audit Log &mdash; Nebula Panel by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
