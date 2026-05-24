import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "dev";
  isBanned: boolean;
  banReason?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nebula_token"));
  const [user, setUser] = useState<AuthUser | null>(null);

  const { data, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: ["getMe"],
      retry: false,
    },
  });

  useEffect(() => {
    if (data) setUser(data as AuthUser);
  }, [data]);

  useEffect(() => {
    if (error) {
      localStorage.removeItem("nebula_token");
      setToken(null);
      setUser(null);
    }
  }, [error]);

  const login = (t: string, u: AuthUser) => {
    localStorage.setItem("nebula_token", t);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("nebula_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading: !!token && isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
