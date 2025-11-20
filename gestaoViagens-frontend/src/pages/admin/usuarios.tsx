"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProtectedPage } from "../../components/ProtectedPage";
import { AppLayout } from "../../components/AppLayout";
import { apiFetch } from "../../services/api";

type Role = "ADMIN" | "MOTORISTA";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
};

type UsuarioForm = {
  nome: string;
  email: string;
  senha: string;
  role: Role;
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<UsuarioForm>({
    nome: "",
    email: "",
    senha: "",
    role: "MOTORISTA",
  });

  async function carregarUsuarios() {
    setLoading(true);
    try {
      const resp = await apiFetch("/api/admin/usuarios");
      if (resp.ok) {
        const data = (await resp.json()) as Usuario[];
        setUsuarios(data);
      } else {
        setUsuarios([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "role" ? (value as Role) : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        role: form.role,
      };

      const resp = await apiFetch("/api/admin/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        setError("Erro ao criar usuário. Verifique os dados informados.");
        return;
      }

      setForm({
        nome: "",
        email: "",
        senha: "",
        role: "MOTORISTA",
      });

      await carregarUsuarios();
    } catch {
      setError("Erro ao criar usuário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Usuários</h1>
            <p className="page-subtitle">
              Cadastre novos administradores e motoristas do sistema.
            </p>
          </div>
        </div>

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">Novo usuário</h2>
            <p className="card-description">
              Preencha os dados abaixo para criar um novo acesso.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="field-label">Nome completo</label>
              <input
                className="input"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                E-mail
              </label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Senha
              </label>
              <input
                className="input"
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                required
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Perfil de acesso
              </label>
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="MOTORISTA">Motorista</option>
                <option value="ADMIN">Administrador</option>
              </select>

              {error && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: "0.8rem",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ marginTop: 14 }}
              >
                {submitting ? "Salvando..." : "Criar usuário"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title">Usuários cadastrados</h2>
            {loading ? (
              <p className="card-description">Carregando...</p>
            ) : usuarios.length === 0 ? (
              <p className="card-description">
                Nenhum usuário cadastrado até o momento.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td>{u.email}</td>
                      <td>{u.role === "ADMIN" ? "Administrador" : "Motorista"}</td>
                      <td>{u.ativo ? "Sim" : "Não"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </AppLayout>
    </ProtectedPage>
  );
}
