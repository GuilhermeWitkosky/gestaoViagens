import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-inner" />
        </div>
        <div className="auth-header">
          <h1 className="auth-title">{title ?? "Bem-vindo"}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
