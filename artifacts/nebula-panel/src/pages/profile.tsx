import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { User, Mail, Lock, ShieldCheck, Calendar, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const roleBadge: Record<string, { cls: string; label: string }> = {
  user:  { cls: "text-slate-300 bg-slate-700/50 border-slate-600/50", label: "User" },
  admin: { cls: "text-amber-300 bg-amber-900/40 border-amber-700/50", label: "Administrator" },
  dev:   { cls: "text-purple-300 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-purple-500/40 shadow-[0_0_10px_rgba(139,92,246,0.2)]", label: "Developer" },
};

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const rb = roleBadge[user?.role ?? "user"];

  const handleSaveEmail = () => {
    updateProfile.mutate({ data: { email } }, {
      onSuccess: (updated: any) => {
        toast({ title: "Email updated" });
      },
      onError: () => toast({ title: "Failed to update email", variant: "destructive" }),
    });
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPw.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    updateProfile.mutate({ data: { currentPassword: currentPw, newPassword: newPw } }, {
      onSuccess: () => {
        toast({ title: "Password changed successfully" });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      },
      onError: (err: any) => toast({ title: err?.data?.error ?? "Failed to change password", variant: "destructive" }),
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Profile & Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
        </div>

        {/* Profile card */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(79,158,255,0.3)]">
                {user?.username[0]?.toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", rb.cls)}>
                  {rb.label}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user?.username}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/60">
                <Calendar size={11} />
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
            {[
              { label: "Role", value: user?.role, icon: <ShieldCheck size={14} className="text-blue-400" /> },
              { label: "Status", value: user?.isBanned ? "Banned" : "Active", icon: <User size={14} className={user?.isBanned ? "text-red-400" : "text-emerald-400"} /> },
              { label: "ID", value: `#${user?.id}`, icon: <Key size={14} className="text-purple-400" /> },
            ].map((s) => (
              <div key={s.label} className="bg-background/50 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-sm font-semibold text-foreground capitalize">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Mail size={16} className="text-blue-400" /> Update Email
          </h3>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/40 transition-all"
            />
            <button
              onClick={handleSaveEmail}
              disabled={updateProfile.isPending || email === user?.email}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Save Email
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Lock size={16} className="text-purple-400" /> Change Password
          </h3>
          <div className="space-y-3">
            {[
              { label: "Current Password", value: currentPw, set: setCurrentPw },
              { label: "New Password", value: newPw, set: setNewPw },
              { label: "Confirm New Password", value: confirmPw, set: setConfirmPw },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  type="password"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500/40 transition-all"
                />
              </div>
            ))}
            <button
              onClick={handleChangePassword}
              disabled={updateProfile.isPending || !currentPw || !newPw || !confirmPw}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {updateProfile.isPending ? "Saving..." : "Change Password"}
            </button>
          </div>
        </div>

        <div className="text-center pb-4">
          <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400/60 hover:text-blue-400 transition-colors">
            <TelegramSvg size={11} /> @RianModss
          </a>
          <p className="text-xs text-muted-foreground/30 mt-0.5">&copy; {new Date().getFullYear()} RianModss — Nebula Panel</p>
        </div>
      </div>
    </Layout>
  );
}
