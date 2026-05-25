import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Terminal, Folder, Database, Calendar, Archive, Network, Play, Users, Settings, Activity } from "lucide-react";

export type ServerTab = "console" | "files" | "databases" | "schedules" | "backups" | "network" | "startup" | "users" | "settings" | "activity";

const tabs: { id: ServerTab; label: string; icon: React.ReactNode }[] = [
  { id: "console",   label: "Console",    icon: <Terminal  size={14} /> },
  { id: "files",     label: "Files",      icon: <Folder    size={14} /> },
  { id: "databases", label: "Databases",  icon: <Database  size={14} /> },
  { id: "schedules", label: "Schedules",  icon: <Calendar  size={14} /> },
  { id: "backups",   label: "Backups",    icon: <Archive   size={14} /> },
  { id: "network",   label: "Network",    icon: <Network   size={14} /> },
  { id: "startup",   label: "Startup",    icon: <Play      size={14} /> },
  { id: "users",     label: "Subusers",   icon: <Users     size={14} /> },
  { id: "settings",  label: "Settings",   icon: <Settings  size={14} /> },
  { id: "activity",  label: "Activity",   icon: <Activity  size={14} /> },
];

interface Props { serverId: number; active: ServerTab; }

export function ServerTabs({ serverId, active }: Props) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-white/5 px-6 scrollbar-none">
      {tabs.map((t) => (
        <Link key={t.id} href={`/servers/${serverId}/${t.id}`}>
          <button className={cn(
            "flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap",
            active === t.id
              ? "border-blue-400 text-blue-300"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-white/20"
          )}>
            {t.icon} {t.label}
          </button>
        </Link>
      ))}
    </div>
  );
}
