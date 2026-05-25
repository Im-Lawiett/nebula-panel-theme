import { useEffect, useState } from "react";
import {
  Settings, Shield, Bell, Wrench, Lock, Globe,
  Save, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAdminSettings, useUpdateAdminSettings } from "@/lib/use-panel-status";

export default function AdminPanelSettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    panelName: "Nebula Panel",
    panelDescription: "Next generation server management panel",
    maintenanceMode: false,
    maintenanceMessage: "Panel sedang dalam maintenance. Silakan coba lagi nanti.",
    antiPeekEnabled: false,
    registrationEnabled: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        panelName: settings.panelName,
        panelDescription: settings.panelDescription,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        antiPeekEnabled: settings.antiPeekEnabled,
        registrationEnabled: settings.registrationEnabled,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    updateSettings.mutate(form, {
      onSuccess: () => {
        toast({
          title: "Pengaturan disimpan",
          description: "Semua perubahan berhasil diterapkan.",
        });
      },
      onError: () => {
        toast({ title: "Gagal menyimpan pengaturan", variant: "destructive" });
      },
    });
  };

  const toggleMaintenance = (val: boolean) => {
    const next = { ...form, maintenanceMode: val };
    setForm(next);
    updateSettings.mutate(next, {
      onSuccess: () => {
        toast({
          title: val ? "Maintenance Mode Aktif" : "Maintenance Mode Nonaktif",
          description: val
            ? "Semua user (kecuali owner ID 1) tidak bisa akses panel."
            : "Panel kembali dapat diakses semua user.",
        });
      },
    });
  };

  const toggleAntiPeek = (val: boolean) => {
    const next = { ...form, antiPeekEnabled: val };
    setForm(next);
    updateSettings.mutate(next, {
      onSuccess: () => {
        toast({
          title: val ? "Anti-Intip Diaktifkan" : "Anti-Intip Dinonaktifkan",
          description: val
            ? "User hanya bisa lihat server milik mereka sendiri."
            : "User bisa melihat semua server.",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Pengaturan Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola konfigurasi, keamanan, dan akses panel
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Simpan
        </Button>
      </div>

      {/* Maintenance Mode - Big Toggle */}
      <Card className={`border-2 transition-all ${form.maintenanceMode ? "border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.15)]" : "border-border bg-card/50"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.maintenanceMode ? "bg-yellow-500/20 border border-yellow-500/30" : "bg-secondary border border-border"}`}>
                <Wrench className={`w-5 h-5 ${form.maintenanceMode ? "text-yellow-400" : "text-muted-foreground"}`} />
              </div>
              <div>
                <CardTitle className="text-base">Maintenance Mode</CardTitle>
                <CardDescription>Blokir akses semua user ke panel (kecuali Owner ID 1)</CardDescription>
              </div>
            </div>
            <Switch
              checked={form.maintenanceMode}
              onCheckedChange={toggleMaintenance}
              className="data-[state=checked]:bg-yellow-500"
            />
          </div>
        </CardHeader>
        {form.maintenanceMode && (
          <CardContent className="pt-0">
            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">
                Maintenance aktif. Semua user (kecuali Owner panel ID 1) tidak dapat mengakses panel dan akan melihat halaman maintenance.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pesan Maintenance</Label>
              <Textarea
                value={form.maintenanceMessage}
                onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                className="bg-background/50 border-white/10 resize-none text-sm"
                rows={2}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Security Settings */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Keamanan
          </CardTitle>
          <CardDescription>Pengaturan privasi dan proteksi akses panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Anti-Intip */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-background/40 border border-border/60">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${form.antiPeekEnabled ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-secondary"}`}>
                {form.antiPeekEnabled ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Anti-Intip Server</p>
                <p className="text-xs text-muted-foreground">User hanya bisa lihat server milik mereka sendiri. Owner (ID 1) tetap bisa lihat semua.</p>
              </div>
            </div>
            <Switch
              checked={form.antiPeekEnabled}
              onCheckedChange={toggleAntiPeek}
            />
          </div>

          {/* Registration */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-background/40 border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-secondary">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Registrasi Terbuka</p>
                <p className="text-xs text-muted-foreground">Izinkan user baru mendaftar akun sendiri</p>
              </div>
            </div>
            <Switch
              checked={form.registrationEnabled}
              onCheckedChange={(v) => setForm({ ...form, registrationEnabled: v })}
            />
          </div>

          {/* Owner Protection Notice */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
            <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">Proteksi Owner Panel</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                User dengan ID 1 adalah pemilik panel dan tidak terkena pembatasan apapun — maintenance mode, anti-intip, maupun ban tidak berlaku untuk Owner.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel Info */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Informasi Panel
          </CardTitle>
          <CardDescription>Nama dan deskripsi panel yang ditampilkan ke user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Panel</Label>
            <Input
              value={form.panelName}
              onChange={(e) => setForm({ ...form, panelName: e.target.value })}
              className="bg-background/50 border-white/10"
              placeholder="Nebula Panel"
            />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi Panel</Label>
            <Input
              value={form.panelDescription}
              onChange={(e) => setForm({ ...form, panelDescription: e.target.value })}
              className="bg-background/50 border-white/10"
              placeholder="Next generation server management panel"
            />
          </div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card className="bg-card/50 border-primary/20 border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <span className="text-primary font-bold text-2xl leading-none">N</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white">Nebula Panel Theme</h3>
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-mono">v1.0.0</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Tema panel Pterodactyl dengan desain dark cyberpunk, lengkap dengan keamanan, chat publik, dan manajemen file.
              </p>
              <Separator className="my-3 bg-border/50" />
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-white font-medium">Developer:</span>
                  <span className="text-primary">RianModss</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <a
                    href="https://t.me/RianModss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    @RianModss
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <p className="text-xs text-muted-foreground">
              Owner ID 1 memiliki akses penuh ke semua fitur tanpa batasan apapun.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
