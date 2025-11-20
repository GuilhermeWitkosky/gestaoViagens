"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

type Role = "ADMIN" | "MOTORISTA";

type AuthUser = {
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await apiFetch("/api/auth/me");
      if (resp.ok) {
        const data = (await resp.json()) as AuthUser;
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, senha: string) => {
      const body = new URLSearchParams({
        username: email,
        password: senha,
      }).toString();

      const resp = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!resp.ok) {
        throw new Error("Login falhou");
      }

      await fetchMe();
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } catch {
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
