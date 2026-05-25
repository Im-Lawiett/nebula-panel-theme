import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useGetServer, getGetServerQueryKey } from "@workspace/api-client-react";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { ServerTabs } from "./server/ServerTabs";
import type { ServerTab } from "./server/ServerTabs";
import { ConsoleTab } from "./server/ConsoleTab";
import { FilesTab } from "./server/FilesTab";
import { DatabasesTab } from "./server/DatabasesTab";
import { BackupsTab } from "./server/BackupsTab";
import { SchedulesTab } from "./server/SchedulesTab";
import { NetworkTab } from "./server/NetworkTab";
import { StartupTab } from "./server/StartupTab";
import { SubusersTab } from "./server/SubusersTab";
import { SettingsTab } from "./server/SettingsTab";
import { ActivityTab } from "./server/ActivityTab";
import { ArrowLeft, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const statusInfo: Record<string, { dot: string; badge: string; label: string }> = {
  running:    { dot: "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Online" },
  stopped:    { dot: "bg-red-400",    badge: "text-red-400 bg-red-400/10 border-red-400/20",       label: "Offline" },
  installing: { dot: "bg-yellow-400 animate-pulse", badge: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", label: "Installing" },
  suspended:  { dot: "bg-orange-400", badge: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "Suspended" },
};

const TAB_ORDER: ServerTab[] = ["console", "files", "databases", "schedules", "backups", "network", "startup", "users", "settings", "activity"];

export default function ServerDetailPage() {
  const params = useParams<{ id: string; tab?: string }>();
  const id = parseInt(params.id ?? "0");
  const tab = (params.tab ?? "console") as ServerTab;
  const [, navigate] = useLocation();

  const { data: server, isLoading } = useGetServer(id, {
    query: { queryKey: getGetServerQueryKey(id), refetchInterval: 5000 },
  });

  const info = server ? (statusInfo[server.status] ?? statusInfo.stopped) : null;

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Server header */}
        <div className="px-6 pt-5 pb-0 border-b border-white/5">
          <button onClick={() => navigate("/servers")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> Back to Servers
          </button>

          {isLoading && <div className="h-10 animate-pulse bg-white/5 rounded-lg w-64 mb-4" />}

          {server && info && (
            <div className="flex items-center gap-4 pb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Server size={20} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {server.name}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", info.badge)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", info.dot)} />
                    {info.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{server.node}</span>
                  <span className="text-xs text-muted-foreground">Owner: <span className="text-foreground">{server.owner}</span></span>
                  <span className="text-xs text-muted-foreground font-mono">ID #{server.id}</span>
                </div>
              </div>
            </div>
          )}

          {server && <ServerTabs serverId={id} active={tab} />}
        </div>

        {/* Tab content */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {server && (
          <div className="flex-1">
            {tab === "console"   && <ConsoleTab server={server} />}
            {tab === "files"     && <FilesTab serverId={id} />}
            {tab === "databases" && <DatabasesTab serverId={id} />}
            {tab === "schedules" && <SchedulesTab serverId={id} />}
            {tab === "backups"   && <BackupsTab serverId={id} />}
            {tab === "network"   && <NetworkTab serverId={id} />}
            {tab === "startup"   && <StartupTab serverId={id} />}
            {tab === "users"     && <SubusersTab serverId={id} />}
            {tab === "settings"  && <SettingsTab server={server} />}
            {tab === "activity"  && <ActivityTab serverId={id} />}
          </div>
        )}

        <div className="text-center py-4 border-t border-white/5 mt-auto">
          <p className="text-xs text-muted-foreground/30">
            Nebula Panel &mdash;{" "}
            <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>{" "}
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </Layout>
  );
}
