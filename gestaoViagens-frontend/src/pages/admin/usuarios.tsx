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
  const [editingId, setEditingId] = useState<number | null>(null);

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
      [name]: name === "role" ? (value as Role) : value,
    }));
  }

  function iniciarEdicao(usuario: Usuario) {
    setEditingId(usuario.id);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      role: usuario.role,
    });
    setError(null);
  }

  function cancelarEdicao() {
    setEditingId(null);
    setForm({
      nome: "",
      email: "",
      senha: "",
      role: "MOTORISTA",
    });
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const body = {
        nome: form.nome,
        email: form.email,
        // se estiver editando e a senha vier em branco, envia null para manter a atual
        senha:
          editingId !== null && form.senha.trim() === ""
            ? null
            : form.senha,
        role: form.role,
      };

      const url =
        editingId === null
          ? "/api/admin/usuarios"
          : `/api/admin/usuarios/${editingId}`;
      const method = editingId === null ? "POST" : "PUT";

      const resp = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        setError("Erro ao salvar usuário. Verifique os dados informados.");
        return;
      }

      setForm({
        nome: "",
        email: "",
        senha: "",
        role: "MOTORISTA",
      });
      setEditingId(null);

      await carregarUsuarios();
    } catch {
      setError("Erro ao salvar usuário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function alterarStatusUsuario(usuario: Usuario) {
    const acao = usuario.ativo ? "desativar" : "ativar";
  
    const confirmar = window.confirm(
      `Tem certeza que deseja ${acao} o usuário "${usuario.nome}"?`
    );
    if (!confirmar) {
      return;
    }
  
    try {
      const url = usuario.ativo
        ? `/api/admin/usuarios/${usuario.id}`
        : `/api/admin/usuarios/${usuario.id}/ativar`;
  
      const method = usuario.ativo ? "DELETE" : "POST";
  
      const resp = await apiFetch(url, { method });
  
      if (!resp.ok) {
        setError(`Erro ao ${acao} usuário.`);
        return;
      }
  
      // se quiser cancelar edição ao mudar status do usuário em edição
      if (editingId === usuario.id) {
        cancelarEdicao();
      }
  
      await carregarUsuarios();
    } catch {
      setError(`Erro ao ${acao} usuário.`);
    }
  }
  

  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Usuários</h1>
            <p className="page-subtitle">
              Cadastre e gerencie administradores e motoristas do sistema.
            </p>
          </div>
        </div>

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">
              {editingId === null ? "Novo usuário" : "Editar usuário"}
            </h2>
            <p className="card-description">
              {editingId === null
                ? "Preencha os dados abaixo para criar um novo acesso."
                : 'Altere os dados e clique em "Salvar alterações". Deixe a senha em branco para mantê-la inalterada.'}
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
                Senha{" "}
                {editingId !== null && (
                  <span style={{ fontWeight: 400, fontSize: "0.8rem" }}>
                    (deixe em branco para não alterar)
                  </span>
                )}
              </label>
              <input
                className="input"
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                required={editingId === null}
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

              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Salvando..."
                    : editingId === null
                    ? "Criar usuário"
                    : "Salvar alterações"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={cancelarEdicao}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
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
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td>{u.email}</td>
                      <td>{u.role === "ADMIN" ? "Administrador" : "Motorista"}</td>
                      <td>{u.ativo ? "Sim" : "Não"}</td>
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: 8,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="btn-primary btn-compact"
                            onClick={() => iniciarEdicao(u)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-ghost btn-compact"
                            onClick={() => alterarStatusUsuario(u)}
                          >
                            {u.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
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
