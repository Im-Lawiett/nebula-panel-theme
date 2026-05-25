import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import { usePanelStatus } from "@/lib/use-panel-status";

export function MotdBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: status } = usePanelStatus();

  if (dismissed || !status?.motdEnabled || !status?.motd) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/30 px-4 py-2.5 flex items-center gap-3 relative">
      <div className="flex items-center gap-2 text-primary flex-shrink-0">
        <Megaphone className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Pengumuman</span>
      </div>
      <p className="text-sm text-white/90 flex-1 truncate">{status.motd}</p>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-muted-foreground hover:text-white transition-colors rounded flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
