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
        const data = await resp.json();
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

      const resp = await apiFetch("/api/admin/locais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        setForm({
          nome: "",
          endereco: "",
          latitude: "",
          longitude: "",
          observacoes: "",
        });
        await loadLocais();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDesativar(id: number) {
    const resp = await apiFetch(`/api/admin/locais/${id}`, {
      method: "DELETE",
    });
    if (resp.ok || resp.status === 204) {
      await loadLocais();
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
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Locais</h1>
            <p className="page-subtitle">
              Cadastre e ajuste os pontos utilizados nas rotas.
            </p>
          </div>
        </div>

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">Novo local</h2>
            <p className="card-description">
              Busque o endereço e ajuste o ponto no mapa, se necessário.
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
                {submitting ? "Salvando..." : "Salvar local"}
              </button>
            </form>

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
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {locais.map((local) => (
                    <tr key={local.id}>
                      <td>{local.nome}</td>
                      <td>{local.endereco}</td>
                      <td>{local.latitude ?? "-"}</td>
                      <td>{local.longitude ?? "-"} </td>
                      <td>
                        <button
                          className="btn-ghost"
                          onClick={() => handleDesativar(local.id)}
                        >
                          Desativar
                        </button>
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
