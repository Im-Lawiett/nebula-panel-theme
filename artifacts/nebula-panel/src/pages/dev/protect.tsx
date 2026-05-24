import { Layout } from "@/components/layout/Layout";
import { useGetProtectStatus, useToggleProtect, getGetProtectStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { cn } from "@/lib/utils";

export default function DevProtectPage() {
  const { data: features, isLoading } = useGetProtectStatus({ query: { queryKey: getGetProtectStatusQueryKey() } });
  const toggleProtect = useToggleProtect();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggle = (id: number, name: string, current: boolean) => {
    toggleProtect.mutate({ data: { id, enabled: !current } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProtectStatusQueryKey() });
        toast({ title: `${name} ${!current ? "enabled" : "disabled"}` });
      },
      onError: () => toast({ title: "Failed to toggle", variant: "destructive" }),
    });
  };

  const enabledCount = (features ?? []).filter((f) => f.enabled).length;
  const totalCount = (features ?? []).length;

  return (
    <Layout requireRole="dev">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-purple-400" />
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Protect Features</h1>
            </div>
            <p className="text-sm text-muted-foreground">Toggle panel security protections. Changes apply immediately.</p>
          </div>
          <div className="bg-card border border-white/5 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-purple-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{enabledCount}/{totalCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <ShieldCheck size={18} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-300">Security Warning</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              These protections modify access controls on your Pterodactyl panel. Only enable features you understand. Developed by <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@RianModss</a>.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Feature list */}
        <div className="space-y-3">
          {(features ?? []).map((feature) => (
            <div
              key={feature.id}
              data-testid={`card-protect-${feature.id}`}
              className={cn(
                "bg-card border rounded-xl p-4 flex items-center gap-4 transition-all duration-200",
                feature.enabled
                  ? "border-purple-500/20 shadow-[0_0_12px_rgba(139,92,246,0.08)]"
                  : "border-white/5"
              )}
            >
              <div className={cn("p-2 rounded-lg shrink-0 transition-colors", feature.enabled ? "bg-purple-500/15" : "bg-white/5")}>
                {feature.enabled
                  ? <ShieldCheck size={20} className="text-purple-400" />
                  : <ShieldOff size={20} className="text-muted-foreground" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{feature.name}</h3>
                  {feature.enabled && (
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{feature.description}</p>
              </div>

              {/* Toggle */}
              <button
                data-testid={`toggle-protect-${feature.id}`}
                onClick={() => handleToggle(feature.id, feature.name, feature.enabled)}
                disabled={toggleProtect.isPending}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-all duration-200 shrink-0 disabled:opacity-50",
                  feature.enabled
                    ? "bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                    : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200",
                  feature.enabled ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Protect Features &mdash; Nebula Panel by{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>
            {" "}&copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
