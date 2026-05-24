import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useCreateUser, getGetUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TelegramSvg } from "@/components/layout/NebulaSvg";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function CreateUserPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" as "user" | "admin" | "dev" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast({ title: "All fields required", variant: "destructive" }); return;
    }
    createUser.mutate({ data: form }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUsersQueryKey() });
        toast({ title: `User ${form.username} created` });
        navigate("/users");
      },
      onError: (err: any) => toast({ title: err?.data?.error ?? "Failed to create user", variant: "destructive" }),
    });
  };

  return (
    <Layout requireRole="admin">
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <button onClick={() => navigate("/users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Users
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <UserPlus size={22} className="text-blue-400" /> Create User
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new user to the panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
          {[
            { label: "Username", key: "username", type: "text", placeholder: "e.g. playerone" },
            { label: "Email", key: "email", type: "email", placeholder: "e.g. player@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-blue-500/40 transition-all"
                required
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/40 transition-all"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="dev">Developer</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => navigate("/users")} className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUser.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {createUser.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/30">
            &copy; {new Date().getFullYear()} RianModss &mdash; <a href="https://t.me/RianModss" target="_blank" rel="noopener noreferrer" className="text-blue-400/40 hover:text-blue-400">@RianModss</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
