import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";

interface LayoutProps {
  children: ReactNode;
  requireRole?: "admin" | "dev";
}

export function Layout({ children, requireRole }: LayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (user.isBanned) return <Redirect to="/banned" />;
  if (requireRole === "dev" && user.role !== "dev") return <Redirect to="/" />;
  if (requireRole === "admin" && user.role === "user") return <Redirect to="/" />;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
