import { useState } from "react";
import { format } from "date-fns";
import { Key, Plus, Trash2, Shield, Activity, User, Loader2, Copy, Eye, EyeOff, Monitor, Smartphone, Globe, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListApiKeys, useCreateApiKey, useDeleteApiKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/user-context";

interface SshKey {
  id: string;
  name: string;
  fingerprint: string;
  createdAt: string;
}

interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  ip: string;
  device: string;
  time: string;
  success: boolean;
}

function genFingerprint(pub: string) {
  let h = 0;
  for (let i = 0; i < pub.length; i++) h = (Math.imul(31, h) + pub.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `SHA256:${hex.slice(0, 4)}:${hex.slice(4)}`;
}

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "1", action: "Login berhasil", detail: "Password authentication", ip: "103.172.18.44", device: "Chrome / Windows", time: new Date(Date.now() - 5 * 60000).toISOString(), success: true },
  { id: "2", action: "Login berhasil", detail: "Password authentication", ip: "103.172.18.44", device: "Chrome / Windows", time: new Date(Date.now() - 2 * 3600000).toISOString(), success: true },
  { id: "3", action: "Login gagal", detail: "Password salah (3x)", ip: "45.33.32.156", device: "Firefox / Linux", time: new Date(Date.now() - 6 * 3600000).toISOString(), success: false },
  { id: "4", action: "Login berhasil", detail: "Password authentication", ip: "103.172.18.44", device: "Safari / macOS", time: new Date(Date.now() - 24 * 3600000).toISOString(), success: true },
  { id: "5", action: "API Key dibuat", detail: "Key untuk Discord Bot", ip: "103.172.18.44", device: "Chrome / Windows", time: new Date(Date.now() - 48 * 3600000).toISOString(), success: true },
  { id: "6", action: "Akun diperbarui", detail: "Email address diubah", ip: "103.172.18.44", device: "Chrome / Windows", time: new Date(Date.now() - 72 * 3600000).toISOString(), success: true },
];

export default function Account() {
  const [description, setDescription] = useState("");
  const [allowedIps, setAllowedIps] = useState("");
  const [sshName, setSshName] = useState("");
  const [sshPub, setSshPub] = useState("");
  const [showSshForm, setShowSshForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentUsername, currentUserId, isOwner } = useUser();

  const { data: apiKeys = [], isLoading } = useListApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();

  const sshStorageKey = `nebula_ssh_keys_${currentUserId}`;
  const [sshKeys, setSshKeys] = useState<SshKey[]>(() => {
    try { return JSON.parse(localStorage.getItem(sshStorageKey) || "[]"); }
    catch { return []; }
  });

  const saveSshKeys = (keys: SshKey[]) => {
    setSshKeys(keys);
    localStorage.setItem(sshStorageKey, JSON.stringify(keys));
  };

  const handleAddSsh = () => {
    if (!sshName.trim() || !sshPub.trim()) return;
    if (!sshPub.startsWith("ssh-")) {
      toast({ title: "Format salah", description: "Public key harus diawali ssh-rsa / ssh-ed25519", variant: "destructive" });
      return;
    }
    const newKey: SshKey = {
      id: Date.now().toString(),
      name: sshName.trim(),
      fingerprint: genFingerprint(sshPub),
      createdAt: new Date().toISOString(),
    };
    saveSshKeys([...sshKeys, newKey]);
    setSshName("");
    setSshPub("");
    setShowSshForm(false);
    toast({ title: "SSH Key ditambahkan", description: `${newKey.name} berhasil ditambahkan.` });
  };

  const handleDeleteSsh = (id: string) => {
    saveSshKeys(sshKeys.filter((k) => k.id !== id));
    toast({ title: "SSH Key dihapus" });
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const ips = allowedIps.split("\n").map((ip) => ip.trim()).filter(Boolean);
    createKey.mutate(
      { data: { description, allowedIps: ips.length > 0 ? ips : undefined } },
      {
        onSuccess: () => {
          setDescription("");
          setAllowedIps("");
          queryClient.invalidateQueries({ queryKey: ["/api/account/api-keys"] });
          toast({ title: "API Key dibuat", description: "Key baru berhasil digenerate." });
        },
      }
    );
  };

  const handleDeleteKey = (identifier: string) => {
    if (!confirm("Hapus API key ini?")) return;
    deleteKey.mutate(
      { identifier },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/account/api-keys"] });
          toast({ title: "API Key dihapus" });
        },
      }
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Password tidak cocok", variant: "destructive" });
      return;
    }
    if (newPw.length < 8) {
      toast({ title: "Password terlalu pendek", description: "Minimal 8 karakter.", variant: "destructive" });
      return;
    }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast({ title: "Password diperbarui", description: "Password baru berhasil disimpan." });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola keamanan dan akses akun kamu</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{currentUsername.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentUsername}</p>
            <p className="text-xs text-muted-foreground">ID: #{currentUserId} {isOwner && "· Owner"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="account" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <User className="w-4 h-4 mr-2" /> Akun
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Key className="w-4 h-4 mr-2" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="ssh" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Shield className="w-4 h-4 mr-2" /> SSH Keys
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Activity className="w-4 h-4 mr-2" /> Aktivitas
          </TabsTrigger>
        </TabsList>

        {/* === ACCOUNT TAB === */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Informasi Akun</CardTitle>
                <CardDescription>Detail profil dan email kamu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={currentUsername} disabled className="bg-background/50 opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={`${currentUsername}@nebula.panel`} className="bg-background/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Depan</Label>
                  <Input defaultValue={currentUsername} className="bg-background/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Belakang</Label>
                  <Input placeholder="(opsional)" className="bg-background/50 border-white/10" />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Simpan Perubahan
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>Pastikan password kamu kuat dan aman</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="bg-background/50 border-white/10 pr-10"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <Input
                      type={showPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="bg-background/50 border-white/10"
                      placeholder="Min. 8 karakter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi Password Baru</Label>
                    <Input
                      type={showPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="bg-background/50 border-white/10"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                  {newPw && confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Password tidak cocok
                    </p>
                  )}
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={!currentPw || !newPw || !confirmPw}>
                    Ubah Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>Tambahkan lapisan keamanan ekstra ke akunmu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-background/40 border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">TOTP Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Google Authenticator, Authy, dsb.</p>
                  </div>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">Belum Aktif</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === API KEYS TAB === */}
        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-card/50 border-border h-fit">
              <CardHeader>
                <CardTitle>Buat API Key</CardTitle>
                <CardDescription>Generate key baru untuk akses application API.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desc">Deskripsi</Label>
                    <Input
                      id="desc"
                      placeholder="contoh: Discord Bot"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ips">IP yang Diizinkan (satu per baris)</Label>
                    <Textarea
                      id="ips"
                      placeholder="Kosongkan untuk izinkan semua IP"
                      value={allowedIps}
                      onChange={(e) => setAllowedIps(e.target.value)}
                      className="bg-background min-h-[80px] font-mono text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!description.trim() || createKey.isPending}
                  >
                    {createKey.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Buat Key
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-card/50 border-border">
              <CardHeader>
                <CardTitle>API Keys Aktif</CardTitle>
                <CardDescription>Kelola credentials API kamu.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg bg-black/20">
                    Belum ada API key yang dibuat.
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow>
                          <TableHead>Identifier</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Terakhir Dipakai</TableHead>
                          <TableHead>Dibuat</TableHead>
                          <TableHead className="text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.identifier}>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-muted-foreground">{key.identifier}</span>
                                <button onClick={() => handleCopy(key.identifier, key.identifier)} className="text-muted-foreground hover:text-primary transition-colors">
                                  {copiedKey === key.identifier ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{key.description}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {key.lastUsedAt ? format(new Date(key.lastUsedAt), "d MMM yyyy HH:mm") : "Belum pernah"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {format(new Date(key.createdAt), "d MMM yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteKey(key.identifier)}
                                disabled={deleteKey.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === SSH KEYS TAB === */}
        <TabsContent value="ssh" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">SSH Keys</h2>
              <p className="text-sm text-muted-foreground">Public key untuk akses SFTP ke server kamu</p>
            </div>
            <Button
              onClick={() => setShowSshForm(!showSshForm)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Key
            </Button>
          </div>

          {showSshForm && (
            <Card className="bg-card/50 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tambah SSH Key Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Key</Label>
                  <Input
                    placeholder="contoh: Laptop Kerja"
                    value={sshName}
                    onChange={(e) => setSshName(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Public Key</Label>
                  <Textarea
                    placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... atau ssh-rsa AAAAB3NzaC1yc2E..."
                    value={sshPub}
                    onChange={(e) => setSshPub(e.target.value)}
                    className="bg-background/50 border-white/10 font-mono text-xs min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Jalankan <code className="bg-black/40 px-1 rounded">ssh-keygen -t ed25519</code> di terminal untuk membuat key baru
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddSsh} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!sshName || !sshPub}>
                    Tambah Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowSshForm(false)} className="border-border">
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {sshKeys.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-border">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">Belum ada SSH key. Tambahkan public key untuk akses SFTP.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sshKeys.map((k) => (
                <Card key={k.id} className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{k.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{k.fingerprint}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(k.createdAt), "d MMM yyyy")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteSsh(k.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === ACTIVITY TAB === */}
        <TabsContent value="activity">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Log Aktivitas Akun
              </CardTitle>
              <CardDescription>Riwayat login dan aktivitas keamanan akun kamu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_ACTIVITY.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 py-3 border-b border-border/40 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      entry.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                    }`}>
                      {entry.success
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <AlertCircle className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white">{entry.action}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(entry.time), "d MMM yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {entry.ip}
                        </span>
                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          {entry.device.includes("mobile") || entry.device.includes("Android") || entry.device.includes("iPhone")
                            ? <Smartphone className="w-3 h-3" />
                            : <Monitor className="w-3 h-3" />
                          }
                          {entry.device}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
