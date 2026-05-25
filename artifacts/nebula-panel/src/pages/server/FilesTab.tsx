import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFiles, deleteFiles, createFolder, getFileContents, writeFile, getUploadUrl } from "@/lib/serverApi";
import type { FileObject } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/lib/auth";
import {
  Folder, FileText, Archive, Code, ArrowLeft, Upload, FolderPlus,
  Trash2, Pencil, Save, X, RefreshCw, ChevronRight, File
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(f: FileObject) {
  if (f.type === "dir") return <Folder size={16} className="text-blue-400" />;
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jar", "zip", "tar", "gz", "rar", "7z"].includes(ext)) return <Archive size={16} className="text-yellow-400" />;
  if (["js", "ts", "py", "java", "sh", "json", "yml", "yaml", "xml", "toml", "ini", "conf", "cfg", "properties", "php", "html", "css"].includes(ext)) return <Code size={16} className="text-emerald-400" />;
  if (["txt", "log", "md"].includes(ext)) return <FileText size={16} className="text-slate-400" />;
  return <File size={16} className="text-muted-foreground" />;
}

const EDITABLE_EXTS = ["txt", "log", "md", "yml", "yaml", "json", "xml", "toml", "ini", "conf", "cfg", "properties", "sh", "js", "ts", "py", "java", "php", "html", "css"];
const isEditable = (name: string) => EDITABLE_EXTS.includes(name.split(".").pop()?.toLowerCase() ?? "");

export function FilesTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dir, setDir] = useState("/");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ name: string; filePath: string } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filesKey = ["files", serverId, dir];
  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: filesKey,
    queryFn: () => listFiles(serverId, dir),
  });

  const deleteMut = useMutation({
    mutationFn: (names: string[]) => deleteFiles(serverId, dir, names),
    onSuccess: () => { qc.invalidateQueries({ queryKey: filesKey }); setSelected(new Set()); toast({ title: "Deleted" }); },
  });

  const folderMut = useMutation({
    mutationFn: (name: string) => createFolder(serverId, dir, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: filesKey }); setNewFolder(false); setNewFolderName(""); },
  });

  const saveMut = useMutation({
    mutationFn: ({ fp, content }: { fp: string; content: string }) => writeFile(serverId, fp, content),
    onSuccess: () => { qc.invalidateQueries({ queryKey: filesKey }); setEditing(null); toast({ title: "File saved" }); },
  });

  const navigateTo = (path: string) => { setDir(path); setSelected(new Set()); };

  const goUp = () => {
    const parts = dir.split("/").filter(Boolean);
    navigateTo(parts.length <= 1 ? "/" : "/" + parts.slice(0, -1).join("/"));
  };

  const openFile = async (f: FileObject) => {
    if (f.type === "dir") { navigateTo(dir === "/" ? `/${f.name}` : `${dir}/${f.name}`); return; }
    if (!isEditable(f.name)) { toast({ title: "Cannot edit binary files" }); return; }
    const fp = dir === "/" ? `/${f.name}` : `${dir}/${f.name}`;
    const content = await getFileContents(serverId, fp);
    setEditing({ name: f.name, filePath: fp });
    setEditContent(content);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;
    const token = getAuthToken();
    const fd = new FormData();
    Array.from(uploadFiles).forEach((f) => fd.append("files", f));
    const res = await fetch(getUploadUrl(serverId, dir), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (res.ok) { qc.invalidateQueries({ queryKey: filesKey }); toast({ title: `${uploadFiles.length} file(s) uploaded` }); }
    e.target.value = "";
  };

  const breadcrumbs = dir.split("/").filter(Boolean);

  // ── Editor view ─────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="p-6 flex flex-col gap-4" style={{ minHeight: 500 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={14} /> Files
            </button>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground font-medium font-mono">{editing.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border border-white/10 rounded-lg hover:border-white/20 transition-all">
              <X size={12} /> Cancel
            </button>
            <button
              onClick={() => saveMut.mutate({ fp: editing.filePath, content: editContent })}
              disabled={saveMut.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              <Save size={12} /> {saveMut.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          spellCheck={false}
          className="flex-1 min-h-[460px] bg-[#080c18] border border-white/8 rounded-xl p-4 text-xs font-mono text-emerald-300/90 focus:outline-none focus:border-blue-500/30 transition-all resize-none leading-relaxed"
        />
      </div>
    );
  }

  // ── File browser ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm flex-wrap font-mono">
          <button onClick={() => navigateTo("/")} className="text-blue-400 hover:text-blue-300 transition-colors">~</button>
          {breadcrumbs.map((crumb, i) => {
            const path = "/" + breadcrumbs.slice(0, i + 1).join("/");
            return (
              <span key={path} className="flex items-center gap-1">
                <span className="text-muted-foreground">/</span>
                <button onClick={() => navigateTo(path)} className="text-muted-foreground hover:text-foreground transition-colors">{crumb}</button>
              </span>
            );
          })}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={() => deleteMut.mutate(Array.from(selected))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 rounded-lg transition-all">
              <Trash2 size={12} /> Delete ({selected.size})
            </button>
          )}
          <button onClick={() => setNewFolder(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-foreground border border-white/10 hover:border-white/20 rounded-lg transition-all">
            <FolderPlus size={12} /> New Folder
          </button>
          <input type="file" ref={fileInputRef} multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all">
            <Upload size={12} /> Upload
          </button>
          <button onClick={() => refetch()} className="p-1.5 text-muted-foreground hover:text-foreground border border-white/8 rounded-lg transition-all">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* New folder form */}
      {newFolder && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (newFolderName) folderMut.mutate(newFolderName); }}
          className="flex items-center gap-2"
        >
          <input
            autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="folder-name"
            className="bg-background border border-blue-500/30 rounded-lg px-3 py-1.5 text-sm text-foreground font-mono focus:outline-none"
          />
          <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">Create</button>
          <button type="button" onClick={() => setNewFolder(false)} className="px-3 py-1.5 text-xs border border-white/10 text-muted-foreground rounded-lg">Cancel</button>
        </form>
      )}

      {/* File list */}
      <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && files.length === 0 && dir === "/" && (
          <div className="text-center py-10 text-sm text-muted-foreground">Empty directory</div>
        )}

        <div className="divide-y divide-white/5">
          {/* Up a level */}
          {dir !== "/" && (
            <div onClick={goUp} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 cursor-pointer transition-colors group">
              <ArrowLeft size={14} className="text-blue-400" />
              <span className="text-sm text-muted-foreground font-mono group-hover:text-foreground transition-colors">..</span>
            </div>
          )}

          {files.map((f) => (
            <div
              key={f.name}
              className={cn("flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors group", selected.has(f.name) && "bg-blue-500/5")}
            >
              <input
                type="checkbox"
                checked={selected.has(f.name)}
                onChange={(e) => {
                  const s = new Set(selected);
                  e.target.checked ? s.add(f.name) : s.delete(f.name);
                  setSelected(s);
                }}
                className="w-3.5 h-3.5 rounded accent-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={() => openFile(f)}>
                {getFileIcon(f)}
                <span className="text-sm text-foreground font-mono truncate hover:text-blue-300 transition-colors">{f.name}</span>
              </div>
              <span className="text-xs text-muted-foreground/50 w-20 text-right shrink-0">{formatSize(f.size)}</span>
              <span className="text-xs text-muted-foreground/40 w-28 text-right hidden md:block shrink-0">
                {new Date(f.modifiedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {f.type === "file" && isEditable(f.name) && (
                  <button onClick={() => openFile(f)} className="p-1 text-muted-foreground hover:text-blue-400 transition-colors rounded" title="Edit">
                    <Pencil size={12} />
                  </button>
                )}
                <button onClick={() => deleteMut.mutate([f.name])} className="p-1 text-muted-foreground hover:text-red-400 transition-colors rounded" title="Delete">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
