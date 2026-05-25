import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PanelStatus {
  maintenanceMode: boolean;
  antiPeekEnabled: boolean;
  registrationEnabled: boolean;
  panelName: string;
  maintenanceMessage: string;
  developerName: string;
  developerTelegram: string;
  motdEnabled: boolean;
  motd: string;
}

export interface AdminSettings extends PanelStatus {
  panelDescription: string;
}

export interface UserStatus {
  id: number;
  username: string;
  isBanned: boolean;
  banReason: string;
}

export function usePanelStatus() {
  return useQuery<PanelStatus>({
    queryKey: ["panel-status"],
    queryFn: async () => {
      const res = await fetch("/api/panel/status");
      if (!res.ok) throw new Error("Failed to fetch panel status");
      return res.json();
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

export function useUserStatus(userId: number, enabled = true) {
  return useQuery<UserStatus>({
    queryKey: ["user-status", userId],
    queryFn: async () => {
      const res = await fetch(`/api/panel/user/${userId}/status`);
      if (!res.ok) throw new Error("Failed to fetch user status");
      return res.json();
    },
    enabled: enabled && userId > 0,
    refetchInterval: 20000,
    staleTime: 10000,
  });
}

export function useAdminSettings() {
  return useQuery<AdminSettings>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminSettings>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json() as Promise<AdminSettings>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["panel-status"] });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to ban user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users/${id}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to unban user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}
