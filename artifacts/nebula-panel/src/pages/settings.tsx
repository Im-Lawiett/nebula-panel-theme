import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Settings, Save, Globe, Palette, Users, Wrench, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelSettings {
  panelName: string;
  panelDescription: string;
  panelUrl: string;
  accentColor: string;
  allowRegistration: boolean;
  maintenanceMessage: string;
}

const inputCls = "w-full bg-background/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";
const selectCls = `${inputCls} cursor-pointer`;

const ACCENT_COLORS = [
  { value: "blue",   label: "Nebula Blue",   cls: "bg-blue-500" },
  { value: "purple", label: "Cosmic Purple", cls: "bg-purple-500" },
  { value: "emerald",label: "Galaxy Green",  cls: "bg-emerald-500" },
  { value: "red",    label: "Nova Red",      cls: "bg-red-500" },
  { value: "amber",  label: "Solar Amber",   cls: "bg-amber-500" },
  { value: "pink",   label: "Stellar Pink",  cls: "bg-pink-500" },
];

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-white/5">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function PanelSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PanelSettings>({
    panelName: "Nebula Panel",
    panelDescription: "Pterodactyl Panel Theme",
    panelUrl: "",
    accentColor: "blue",
    allowRegistration: false,
    maintenanceMessage: "The panel is currently under maintenance. Please check back later.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const r = await fetch("/api/settings");
      if (r.ok) setSettings(await r.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const set = (k: keyof PanelSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setSettings((s) => ({ ...s, [k]: e.target.value }));

  const setCheck = (k: keyof PanelSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) => ({ ...s, [k]: e.target.checked }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("nebula_token");
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(settings),
      });
      if (!r.ok) {
        const e = await r.json();
        toast({ title: e.error ?? "Failed to save settings", variant: "destructive" });
      } else {
        toast({ title: "✅ Panel settings saved", description: "Changes are live immediately." });
        // Reload so sidebar etc. picks up the new name
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Layout requireRole="dev">
        <div className="p-6 flex items-center justify-center">
          <RefreshCw size={20} className="text-muted-foreground animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireRole="dev">
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Settings size={20} className="text-blue-400" /> Panel Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure your panel's name, appearance, and behaviour</p>
        </div>

        {/* Branding */}
        <SectionCard icon={<Globe size={15} />} title="Branding" subtitle="Panel name and identity">
          <Field label="Panel Name" hint="shown in sidebar & browser title">
            <input type="text" value={settings.panelName} onChange={set("panelName")} className={inputCls} placeholder="Nebula Panel" />
          </Field>
          <Field label="Panel Description" hint="shown on login page">
            <input type="text" value={settings.panelDescription} onChange={set("panelDescription")} className={inputCls} placeholder="Pterodactyl Panel Theme" />
          </Field>
          <Field label="Panel URL" hint="optional, for emails/links">
            <input type="url" value={settings.panelUrl} onChange={set("panelUrl")} className={inputCls} placeholder="https://panel.yourdomain.com" />
          </Field>
        </SectionCard>

        {/* Appearance */}
        <SectionCard icon={<Palette size={15} />} title="Appearance" subtitle="Visual theme settings">
          <Field label="Accent Color">
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, accentColor: c.value }))}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                    settings.accentColor === c.value
                      ? "border-white/30 bg-white/10 text-foreground"
                      : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  <span className={cn("w-3 h-3 rounded-full shrink-0", c.cls)} />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* Registration */}
        <SectionCard icon={<Users size={15} />} title="Registration" subtitle="Who can sign up">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Allow User Registration</p>
              <p className="text-xs text-muted-foreground mt-0.5">Enable the public sign-up form on the login page</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.allowRegistration} onChange={setCheck("allowRegistration")} className="sr-only peer" />
              <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </SectionCard>

        {/* Maintenance */}
        <SectionCard icon={<Wrench size={15} />} title="Maintenance" subtitle="Message shown when maintenance mode is on">
          <Field label="Maintenance Message">
            <textarea value={settings.maintenanceMessage} onChange={set("maintenanceMessage")} rows={3}
              className={`${inputCls} resize-none`}
              placeholder="The panel is currently under maintenance..." />
          </Field>
        </SectionCard>

        {/* Save */}
        <div className="flex gap-3 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            <Save size={15} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {user?.role !== "dev" && (
          <p className="text-center text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
            Only the dev account (ID 1) can save settings changes.
          </p>
        )}
      </div>
    </Layout>
  );
}
