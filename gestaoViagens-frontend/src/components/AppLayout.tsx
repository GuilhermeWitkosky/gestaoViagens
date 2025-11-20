"use client";

import { ReactNode, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

type Role = "ADMIN" | "MOTORISTA";

type NavItem = {
  label: string;
  href: string;
};

type Props = {
  children: ReactNode;
  role: Role;
};

const adminItems: NavItem[] = [
  { label: "Visão geral", href: "/" },
  { label: "Locais", href: "/admin/locais" },
  { label: "Viagens", href: "/admin/viagens" },
  { label: "Usuários", href: "/admin/usuarios" },
];

const motoristaItems: NavItem[] = [
  { label: "Minhas viagens", href: "/motorista/viagens" },
  { label: "Criar viagem", href: "/motorista/viagens/nova" },
];

export function AppLayout({ children, role }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = useMemo(
    () => (role === "ADMIN" ? adminItems : motoristaItems),
    [role]
  );

  function isActive(href: string) {
    const path = router.pathname;
  
    if (path === href) return true;
  
    const segments = href.split("/");
    if (segments.length > 2 && path.startsWith(href + "/")) {
      return true;
    }
  
    return false;
  }
  

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-badge">
            <div className="sidebar-logo-dot" />
          </div>
          <div>
            <div className="sidebar-title">TripFlow</div>
            <div className="sidebar-badge">
              {role === "ADMIN" ? "Admin" : "Motorista"}
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          {user && (
            <>
              <strong>{user.email}</strong>
              <span>{role === "ADMIN" ? "Administrador" : "Motorista"}</span>
            </>
          )}
        </div>

        <div className="sidebar-nav-title">Navegação</div>
        <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            <div className="sidebar-link-icon" />
            <span className="sidebar-link-label">{item.label}</span>
            {isActive(item.href) && (
              <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>•</span>
            )}
          </Link>
        ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  );
}
