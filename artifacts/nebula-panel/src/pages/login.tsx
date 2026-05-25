import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useListUsers } from "@workspace/api-client-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useUser();
  const [, navigate] = useLocation();
  const { data: users = [] } = useListUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const found = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!found) {
      setError("Username tidak ditemukan. Coba: dilzz, jelen, atau pano");
      setLoading(false);
      return;
    }
    if (password !== "demo" && password !== "admin") {
      setError("Password salah. Gunakan: demo");
      setLoading(false);
      return;
    }

    setCurrentUser(found.id, found.username);
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.4)]">
            <span className="text-primary font-bold text-4xl leading-none">N</span>
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-6 font-mono tracking-widest uppercase">
          Nebula Panel
        </p>

        <Card className="border-border bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Selamat datang</CardTitle>
            <CardDescription className="text-muted-foreground">
              Masuk untuk mengakses server kamu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="dilzz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-muted-foreground">Demo: gunakan "demo"</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-white/10"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.5)] border-0"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Masuk
              </Button>
            </form>
            <div className="text-xs text-center text-muted-foreground/60 border-t border-border/50 pt-3">
              Akun demo: dilzz / jelen / pano &middot; password: demo
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun? <Link href="/register" className="text-primary hover:underline">Daftar</Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Developer: @RianModss &middot; Telegram: @RianModss
        </p>
      </div>
    </div>
  );
}
