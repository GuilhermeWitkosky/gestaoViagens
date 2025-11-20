"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { AppLayout } from "../../../components/AppLayout";
import { apiFetch } from "../../../services/api";

type Local = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
};

type ViagemCreateResponse = {
  id: number;
};

export default function NovaViagemPage() {
  const router = useRouter();

  const [locais, setLocais] = useState<Local[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [nome, setNome] = useState("");
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocais() {
      setLoadingLocais(true);
      try {
        const resp = await apiFetch("/api/admin/locais");
        if (resp.ok) {
          const data = (await resp.json()) as Local[];
          setLocais(data);
        } else {
          setLocais([]);
        }
      } finally {
        setLoadingLocais(false);
      }
    }
    loadLocais();
  }, []);

  function toggleLocal(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
  
    if (selectedIds.length < 2) {
      setError("Selecione pelo menos dois locais para a viagem.");
      return;
    }
  
    setSubmitting(true);
    try {
      const body = {
        nome: nome.trim().length > 0 ? nome.trim() : null,
        locaisIds: selectedIds,
        motoristaId: null,
      };
  
      const resp = await apiFetch("/api/motorista/viagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!resp.ok) {
        setError("Erro ao criar viagem. Tente novamente.");
        return;
      }
  
      const data = (await resp.json()) as { id: number };
      router.push(`/motorista/viagens/${data.id}`);
    } catch {
      setError("Erro ao criar viagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }
  

  return (
    <ProtectedPage allowedRoles={["MOTORISTA"]}>
      <AppLayout role="MOTORISTA">
        <div className="page-header">
          <div>
            <h1 className="page-title">Nova viagem</h1>
            <p className="page-subtitle">
              Selecione os locais de parada e defina um nome para identificar a viagem.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Configuração da viagem</h2>

          <form onSubmit={handleSubmit}>
            <label className="field-label">Nome da viagem (opcional)</label>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Rota de entregas da manhã"
            />

            <label className="field-label" style={{ marginTop: 12 }}>
              Locais da rota
            </label>

            {loadingLocais ? (
              <p className="card-description">Carregando locais...</p>
            ) : locais.length === 0 ? (
              <p className="card-description">
                Nenhum local disponível. Peça para o administrador cadastrar locais.
              </p>
            ) : (
              <div
                style={{
                  borderRadius: 8,
                  border: "1px solid rgba(15,23,42,0.08)",
                  maxHeight: 260,
                  overflow: "auto",
                  padding: 8,
                  marginTop: 4,
                }}
              >
                {locais.map((local) => {
                  const checked = selectedIds.includes(local.id);
                  return (
                    <label
                      key={local.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "4px 2px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocal(local.id)}
                        style={{ marginTop: 3 }}
                      />
                      <span>
                        <strong>{local.nome}</strong>
                        <br />
                        <span style={{ opacity: 0.8 }}>
                          {local.endereco}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: "0.85rem",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || locais.length < 2 || selectedIds.length < 2}
            style={{ marginTop: 16 }}
          >
            {submitting ? "Criando viagem..." : "Criar viagem"}
          </button>
          </form>
        </div>
      </AppLayout>
    </ProtectedPage>
  );
}
