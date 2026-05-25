import { getAuthToken } from "./auth";

const BASE = "/api";

async function req<T>(method: string, path: string, body?: unknown, isText = false): Promise<T> {
  const token = getAuthToken?.();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined && !isText ? { "Content-Type": "application/json" } : {}),
      ...(body !== undefined && isText ? { "Content-Type": "text/plain" } : {}),
    },
    body: body !== undefined ? (isText ? body as string : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw Object.assign(new Error(err.error ?? "Request failed"), { data: err });
  }
  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json();
  return res.text() as unknown as T;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface FileObject { name: string; type: "file" | "dir"; size: number; mode: number; modifiedAt: string; }
export interface Database { id: number; name: string; username: string; host: string; port: number; password: string; createdAt: string; }
export interface Backup { uuid: string; name: string; successful: boolean; locked: boolean; size: number; createdAt: string; completedAt: string | null; }
export interface Schedule { id: number; name: string; cron: { minute: string; hour: string; dom: string; month: string; dow: string }; active: boolean; processing: boolean; lastRunAt: string | null; nextRunAt: string; tasks: Array<{ id: number; action: string; payload: string; timeOffset: number }>; }
export interface Allocation { id: number; ip: string; port: number; alias: string | null; primary: boolean; }
export interface StartupData { startup: string; variables: Array<{ name: string; description: string; envVariable: string; defaultValue: string; serverValue: string; isEditable: boolean; rules: string }>; }
export interface Subuser { uuid: string; username: string; email: string; twoFactorEnabled: boolean; createdAt: string; permissions: string[]; }
export interface Egg { id: number; nestId: number; nestName: string; name: string; description: string; dockerImage: string; startupCommand: string; }
export interface Mount { id: number; name: string; description: string; source: string; target: string; readOnly: boolean; userMountable: boolean; servers: number; }
export interface Location { id: number; short: string; long: string; nodes: number; servers: number; }

// ─── FILES ───────────────────────────────────────────────────────────────────
export const listFiles = (sid: number, dir = "/") => req<FileObject[]>("GET", `/servers/${sid}/files/list?directory=${encodeURIComponent(dir)}`);
export const getFileContents = (sid: number, file: string) => req<string>("GET", `/servers/${sid}/files/contents?file=${encodeURIComponent(file)}`);
export const writeFile = (sid: number, file: string, content: string) => req<void>("POST", `/servers/${sid}/files/write?file=${encodeURIComponent(file)}`, content, true);
export const renameFiles = (sid: number, root: string, files: Array<{ from: string; to: string }>) => req<void>("POST", `/servers/${sid}/files/rename`, { root, files });
export const deleteFiles = (sid: number, root: string, files: string[]) => req<void>("POST", `/servers/${sid}/files/delete`, { root, files });
export const createFolder = (sid: number, directory: string, name: string) => req<void>("POST", `/servers/${sid}/files/create-folder`, { directory, name });
export const getUploadUrl = (sid: number, dir: string) => `/api/servers/${sid}/files/upload?directory=${encodeURIComponent(dir)}`;

// ─── DATABASES ───────────────────────────────────────────────────────────────
export const getDatabases = (sid: number) => req<Database[]>("GET", `/servers/${sid}/databases`);
export const createDatabase = (sid: number, name: string) => req<Database>("POST", `/servers/${sid}/databases`, { name });
export const deleteDatabase = (sid: number, dbId: number) => req<void>("DELETE", `/servers/${sid}/databases/${dbId}`);
export const rotatePassword = (sid: number, dbId: number) => req<Database>("POST", `/servers/${sid}/databases/${dbId}/rotate-password`);

// ─── BACKUPS ─────────────────────────────────────────────────────────────────
export const getBackups = (sid: number) => req<Backup[]>("GET", `/servers/${sid}/backups`);
export const createBackup = (sid: number, name?: string, locked = false) => req<Backup>("POST", `/servers/${sid}/backups`, { name, locked });
export const deleteBackup = (sid: number, uuid: string) => req<void>("DELETE", `/servers/${sid}/backups/${uuid}`);
export const restoreBackup = (sid: number, uuid: string) => req<void>("POST", `/servers/${sid}/backups/${uuid}/restore`);
export const toggleBackupLock = (sid: number, uuid: string) => req<Backup>("POST", `/servers/${sid}/backups/${uuid}/lock`);

// ─── SCHEDULES ───────────────────────────────────────────────────────────────
export const getSchedules = (sid: number) => req<Schedule[]>("GET", `/servers/${sid}/schedules`);
export const createSchedule = (sid: number, data: { name: string; cron_minute: string; cron_hour: string; cron_dom: string; cron_month: string; cron_dow: string }) => req<Schedule>("POST", `/servers/${sid}/schedules`, data);
export const deleteSchedule = (sid: number, schedId: number) => req<void>("DELETE", `/servers/${sid}/schedules/${schedId}`);

// ─── ALLOCATIONS ─────────────────────────────────────────────────────────────
export const getAllocations = (sid: number) => req<Allocation[]>("GET", `/servers/${sid}/allocations`);
export const setPrimaryAllocation = (sid: number, allocId: number) => req<Allocation[]>("POST", `/servers/${sid}/allocations/${allocId}/primary`);
export const deleteAllocation = (sid: number, allocId: number) => req<void>("DELETE", `/servers/${sid}/allocations/${allocId}`);

// ─── STARTUP ─────────────────────────────────────────────────────────────────
export const getStartup = (sid: number) => req<StartupData>("GET", `/servers/${sid}/startup`);
export const updateVariable = (sid: number, key: string, value: string) => req<StartupData>("PUT", `/servers/${sid}/startup/variable`, { key, value });

// ─── SUBUSERS ────────────────────────────────────────────────────────────────
export const getSubusers = (sid: number) => req<Subuser[]>("GET", `/servers/${sid}/subusers`);
export const createSubuser = (sid: number, email: string, permissions: string[]) => req<Subuser>("POST", `/servers/${sid}/subusers`, { email, permissions });
export const deleteSubuser = (sid: number, uuid: string) => req<void>("DELETE", `/servers/${sid}/subusers/${uuid}`);

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const getEggs = () => req<Egg[]>("GET", "/admin/eggs");
export const getMounts = () => req<Mount[]>("GET", "/admin/mounts");
export const createMount = (data: Omit<Mount, "id" | "servers">) => req<Mount>("POST", "/admin/mounts", data);
export const deleteMount = (id: number) => req<void>("DELETE", `/admin/mounts/${id}`);
export const getLocations = () => req<Location[]>("GET", "/admin/locations");
