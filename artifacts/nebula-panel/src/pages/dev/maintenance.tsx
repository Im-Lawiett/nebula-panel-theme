import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useGetMaintenanceStatus, useSetMaintenance, getGetMaintenanceStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Power } from "lucide-react";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { cn } from "@/lib/utils";

export default function DevMaintenancePage() {
  const { data: status, isLoading } = useGetMaintenanceStatus({ query: { queryKey: getGetMaintenanceStatusQueryKey() } });
  const setMaintenance = useSetMaintenance();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status?.message) setMessage(status.message);
  }, [status?.message]);

  const handleToggle = () => {
    const newState = !status?.enabled;
    setMaintenance.mutate(
      { data: { enabled: newState, message: message || "Panel is under maintenance." } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMaintenanceStatusQueryKey() });
          toast({ title: `Maintenance mode ${newState ? "enabled" : "disabled"}` });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  const handleSaveMessage = () => {
    setMaintenance.mutate(
      { data: { enabled: status?.enabled ?? false, message } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMaintenanceStatusQueryKey() });
          toast({ title: "Maintenance message updated" });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  return (
    <Layout requireRole="dev">
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Maintenance Mode</h1>
            <p className="text-sm text-muted-foreground">Take the panel offline for all non-dev users</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Main toggle card */}
            <div className={cn(
              "relative overflow-hidden border rounded-2xl p-8 text-center transition-all duration-300",
              status?.enabled
                ? "bg-yellow-500/5 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                : "bg-card border-white/5"
            )}>
              {status?.enabled && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
                </div>
              )}

              <div className={cn(
                "inline-flex items-center justify-center w-20 h-20 rounded-full border-4 mb-6 transition-all duration-300",
                status?.enabled
                  ? "bg-yellow-500/15 border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                  : "bg-muted border-white/10"
              )}>
                <Power size={36} className={cn("transition-colors", status?.enabled ? "text-yellow-400" : "text-muted-foreground")} />
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {status?.enabled ? (
                  <span className="text-yellow-300">Maintenance Active</span>
                ) : (
                  <span className="text-foreground">Panel Online</span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {status?.enabled
                  ? "All users (except devs) are currently blocked from accessing the panel."
                  : "All users can access the panel normally."}
              </p>

              <button
                data-testid="button-toggle-maintenance"
                onClick={handleToggle}
                disabled={setMaintenance.isPending}
                className={cn(
                  "px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg disabled:opacity-50",
                  status?.enabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-500/20"
                )}
              >
                {setMaintenance.isPending
                  ? "Updating..."
                  : status?.enabled ? "Disable Maintenance" : "Enable Maintenance"
                }
              </button>
            </div>

            {/* Message editor */}
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Maintenance Message</h3>
              <p className="text-xs text-muted-foreground mb-3">This message is shown to users on the maintenance page.</p>
              <textarea
                data-testid="input-maintenance-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 resize-none transition-all"
                placeholder="Enter maintenance message..."
              />
              <button
                data-testid="button-save-message"
                onClick={handleSaveMessage}
                disabled={setMaintenance.isPending}
                className="mt-3 px-4 py-2 bg-card border border-white/10 hover:border-white/20 rounded-lg text-sm font-medium text-foreground transition-all disabled:opacity-50"
              >
                Save Message
              </button>
            </div>

            {/* Info */}
            <div className="bg-card border border-white/5 rounded-xl p-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                Developers (role: dev) are never blocked by maintenance mode.
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                All other users will see the maintenance page until you disable it.
              </p>
            </div>
          </>
        )}

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground/30">
            Maintenance Control &mdash; Nebula Panel by{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>
            {" "}&copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
