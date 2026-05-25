import { ShieldBan, MessageCircle } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useUserStatus, usePanelStatus } from "@/lib/use-panel-status";

export function BanOverlay() {
  const { currentUserId, isOwner } = useUser();
  const { data: userStatus } = useUserStatus(currentUserId, !isOwner);
  const { data: panelStatus } = usePanelStatus();

  if (isOwner || !userStatus?.isBanned) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/97 backdrop-blur-md">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <ShieldBan className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Anda telah di ban
          </h1>
          {userStatus.banReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-3">
              <p className="text-sm text-red-300">Alasan: {userStatus.banReason}</p>
            </div>
          )}
          <p className="text-muted-foreground leading-relaxed">
            Akun kamu telah diblokir dari panel ini.
            Hubungi segera pemilik panel nya untuk informasi lebih lanjut.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3">
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          <span>Hubungi: <strong>{panelStatus?.developerTelegram || "@RianModss"}</strong> di Telegram</span>
        </div>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground/60">
            Developer: {panelStatus?.developerName || "RianModss"} &middot; Telegram: {panelStatus?.developerTelegram || "@RianModss"}
          </p>
        </div>
      </div>
    </div>
  );
}
