import { Wrench } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { usePanelStatus } from "@/lib/use-panel-status";

export function MaintenanceOverlay() {
  const { isOwner } = useUser();
  const { data: status } = usePanelStatus();

  if (isOwner || !status?.maintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/97 backdrop-blur-md">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-yellow-500/10 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <Wrench className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Server sedang Maintenance
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {status.maintenanceMessage}
          </p>
        </div>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground/60">
            Developer: {status.developerName} &middot; Telegram: {status.developerTelegram}
          </p>
        </div>
      </div>
    </div>
  );
}
