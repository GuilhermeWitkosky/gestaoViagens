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
  { label: "Locais", href: "/admin/locais" },
];

export function AppLayout({ children, role }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Se o usuário estiver logado, usamos o role real dele.
  // O "role" passado por props vira apenas um fallback.
  const effectiveRole: Role = (user?.role as Role) ?? role;

  const items = useMemo(
    () => (effectiveRole === "ADMIN" ? adminItems : motoristaItems),
    [effectiveRole]
  );

  function isActive(href: string) {
    const path = router.pathname;

    // match exato
    if (path === href) return true;

    // detalhes de viagens do ADMIN: /admin/viagens/[id]
    if (href === "/admin/viagens" && path.startsWith("/admin/viagens/")) {
      return true;
    }

    // detalhes de viagens do MOTORISTA: /motorista/viagens/[id]
    // mas não marcar quando for /motorista/viagens/nova
    if (
      href === "/motorista/viagens" &&
      path.startsWith("/motorista/viagens/") &&
      path !== "/motorista/viagens/nova"
    ) {
      return true;
    }

    // criar viagem motorista
    if (
      href === "/motorista/viagens/nova" &&
      path === "/motorista/viagens/nova"
    ) {
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
              {effectiveRole === "ADMIN" ? "Admin" : "Motorista"}
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          {user && (
            <>
              <strong>{user.email}</strong>
              <span>
                {effectiveRole === "ADMIN" ? "Administrador" : "Motorista"}
              </span>
            </>
          )}
        </div>

        <div className="sidebar-nav-title">Navegação</div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                isActive(item.href) ? "active" : ""
              }`}
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
