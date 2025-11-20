"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

type Role = "ADMIN" | "MOTORISTA";

type Props = {
  children: ReactNode;
  allowedRoles?: Role[];
};

export function ProtectedPage({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/motorista");
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
