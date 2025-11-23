"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AuthLayout } from "../../components/AuthLayout";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Após autenticar (ou se já estiver logado), redireciona conforme o perfil
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "ADMIN") {
        router.replace("/");
      } else {
        router.replace("/motorista/viagens");
      }
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, senha);
      // redirecionamento acontece no useEffect acima
    } catch (err) {
      setError("Credenciais inválidas. Verifique usuário e senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="TripFlow"
      subtitle="Faça login para gerenciar viagens e rotas."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">E-mail</label>
          <input
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            required
          />
        </div>
        <div>
          <label className="field-label">Senha</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            required
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Continuar"}
        </button>
      </form>
      <div className="auth-footer">
        <span>TripFlow • Gestão de viagens</span>
        <span>2025</span>
      </div>
    </AuthLayout>
  );
}
