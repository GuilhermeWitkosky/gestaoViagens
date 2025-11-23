"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProtectedPage } from "../../components/ProtectedPage";
import { AppLayout } from "../../components/AppLayout";
import { apiFetch } from "../../services/api";
import { AddressAutocompleteInput } from "../../components/AddressAutocompleteInput";
import { LocationPickerMap } from "../../components/LocationPickerMap";

type Local = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  observacoes: string | null;
  ativo: boolean;
};

type LocalForm = {
  nome: string;
  endereco: string;
  latitude: string;
  longitude: string;
  observacoes: string;
};

export default function LocaisPage() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<LocalForm>({
    nome: "",
    endereco: "",
    latitude: "",
    longitude: "",
    observacoes: "",
  });

  async function loadLocais() {
    setLoading(true);
    try {
      const resp = await apiFetch("/api/admin/locais");
      if (resp.ok) {
        const data = (await resp.json()) as Local[];
        setLocais(data);
      } else {
        setLocais([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocais();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      nome: "",
      endereco: "",
      latitude: "",
      longitude: "",
      observacoes: "",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        nome: form.nome,
        endereco: form.endereco,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        observacoes: form.observacoes || null,
      };

      const url = editingId
        ? `/api/admin/locais/${editingId}`
        : "/api/admin/locais";
      const method = editingId ? "PUT" : "POST";

      const resp = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        alert(
          editingId
            ? "Erro ao atualizar local."
            : "Erro ao cadastrar local."
        );
        return;
      }

      resetForm();
      await loadLocais();
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditar(local: Local) {
    setEditingId(local.id);
    setForm({
      nome: local.nome,
      endereco: local.endereco,
      latitude: local.latitude != null ? String(local.latitude) : "",
      longitude: local.longitude != null ? String(local.longitude) : "",
      observacoes: local.observacoes ?? "",
    });
  }

  async function handleToggleAtivo(local: Local) {
    const mensagem = local.ativo
      ? "Tem certeza que deseja desativar este local?"
      : "Tem certeza que deseja ativar este local?";

    const confirma = window.confirm(mensagem);
    if (!confirma) return;

    try {
      let resp: Response;

      if (local.ativo) {
        // desativar
        resp = await apiFetch(`/api/admin/locais/${local.id}`, {
          method: "DELETE",
        });
      } else {
        // ativar (usa o endpoint que você já tem)
        resp = await apiFetch(`/api/admin/locais/${local.id}/ativar`, {
          method: "POST",
        });
      }

      if (!resp.ok && resp.status !== 204) {
        alert("Erro ao alterar situação do local.");
        return;
      }

      await loadLocais();
    } catch {
      alert("Erro ao alterar situação do local.");
    }
  }

  const selectedLat =
    form.latitude && !Number.isNaN(Number(form.latitude))
      ? Number(form.latitude)
      : null;
  const selectedLng =
    form.longitude && !Number.isNaN(Number(form.longitude))
      ? Number(form.longitude)
      : null;

  return (
    <ProtectedPage allowedRoles={["ADMIN", "MOTORISTA"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Locais</h1>
            <p className="page-subtitle">
              Cadastre e ajuste os pontos utilizados na criação de rotas.
            </p>
          </div>
        </div>

        {/* Layout igual ao original: formulário + mapa na esquerda, tabela na direita */}
        <section className="form-grid">
          {/* ESQUERDA: formulário + mapa abaixo */}
          <div className="card">
            <h2 className="card-title">
              {editingId ? "Editar local" : "Novo local"}
            </h2>
            <p className="card-description">
              {editingId
                ? "Ajuste os dados do local e salve para atualizar."
                : "Busque o endereço e refine a posição no mapa, se necessário."}
            </p>

            <form onSubmit={handleSubmit}>
              <label className="field-label">Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="input"
                required
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Endereço
              </label>
              <AddressAutocompleteInput
                value={form.endereco}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, endereco: value }))
                }
                onPlaceSelected={({ address, lat, lng }) =>
                  setForm((prev) => ({
                    ...prev,
                    endereco: address,
                    latitude: lat != null ? String(lat) : prev.latitude,
                    longitude: lng != null ? String(lng) : prev.longitude,
                  }))
                }
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Latitude
              </label>
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                className="input"
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Longitude
              </label>
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                className="input"
              />

              <label className="field-label" style={{ marginTop: 10 }}>
                Observações
              </label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                className="input"
                rows={3}
              />

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ marginTop: 14 }}
              >
                {submitting
                  ? editingId
                    ? "Atualizando..."
                    : "Salvando..."
                  : editingId
                  ? "Atualizar local"
                  : "Salvar local"}
              </button>
            </form>

            {/* Mapa logo abaixo do formulário, como era antes */}
            <div style={{ marginTop: 18 }}>
              <h3
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  marginBottom: 4,
                  color: "var(--color-primary-soft)",
                }}
              >
                Ajustar posição no mapa
              </h3>
              <LocationPickerMap
                lat={selectedLat}
                lng={selectedLng}
                onChange={(lat, lng) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude: String(lat),
                    longitude: String(lng),
                  }))
                }
              />
            </div>
          </div>

          {/* DIREITA: tabela de locais */}
          <div className="card">
            <h2 className="card-title">Locais cadastrados</h2>
            {loading ? (
              <p className="card-description">Carregando...</p>
            ) : locais.length === 0 ? (
              <p className="card-description">Nenhum local cadastrado.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Nome</th>
                    <th style={{ textAlign: "center" }}>Endereço</th>
                    <th style={{ textAlign: "center" }}>Lat</th>
                    <th style={{ textAlign: "center" }}>Lng</th>
                    <th style={{ textAlign: "center" }}>Situação</th>
                    <th style={{ textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {locais.map((local) => {
                    const nomeCurto =
                      local.nome.length > 32
                        ? local.nome.slice(0, 32) + "..."
                        : local.nome;
                    const enderecoCurto =
                      local.endereco.length > 42
                        ? local.endereco.slice(0, 42) + "..."
                        : local.endereco;

                    return (
                      <tr key={local.id}>
                        <td
                          style={{ textAlign: "center" }}
                          title={local.nome}
                        >
                          {nomeCurto}
                        </td>
                        <td
                          style={{ textAlign: "center" }}
                          title={local.endereco}
                        >
                          {enderecoCurto}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {local.latitude != null
                            ? local.latitude.toFixed(2)
                            : "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {local.longitude != null
                            ? local.longitude.toFixed(2)
                            : "-"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {local.ativo ? "Ativo" : "Inativo"}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <button
                            type="button"
                            className="btn-primary btn-compact"
                            onClick={() => handleEditar(local)}
                          >
                            Editar
                          </button>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => handleToggleAtivo(local)}
                            >
                              {local.ativo ? "Desativar" : "Ativar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </AppLayout>
    </ProtectedPage>
  );
}
