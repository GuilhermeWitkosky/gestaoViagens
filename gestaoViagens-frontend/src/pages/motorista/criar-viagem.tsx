"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../components/ProtectedPage";
import { AppLayout } from "../../components/AppLayout";
import { apiFetch } from "../../services/api";
import { RouteMap } from "../../components/RouteMap";

type Local = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
};

type SelectedLocal = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
};

export default function CriarViagemPage() {
  const router = useRouter();
  const [locais, setLocais] = useState<Local[]>([]);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [nomeViagem, setNomeViagem] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadLocais() {
    setLoadingLocais(true);
    try {
      const resp = await apiFetch("/api/locais");
      if (resp.ok) {
        const data = await resp.json();
        setLocais(data);
      } else {
        setLocais([]);
      }
    } finally {
      setLoadingLocais(false);
    }
  }

  useEffect(() => {
    loadLocais();
  }, []);

  function toggleLocal(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function moveSelected(id: number, direction: "up" | "down") {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const clone = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const temp = clone[idx];
      clone[idx] = clone[swapIdx];
      clone[swapIdx] = temp;
      return clone;
    });
  }

  const selecionados: SelectedLocal[] = useMemo(
    () =>
      selectedIds
        .map((id) => locais.find((l) => l.id === id))
        .filter((l): l is Local => Boolean(l))
        .map((l) => ({
          id: l.id,
          nome: l.nome,
          endereco: l.endereco,
          latitude: l.latitude,
          longitude: l.longitude,
        })),
    [selectedIds, locais]
  );

  const routePoints = useMemo(
    () =>
      selecionados
        .filter(
          (l) =>
            l.latitude !== null &&
            !Number.isNaN(l.latitude) &&
            l.longitude !== null &&
            !Number.isNaN(l.longitude)
        )
        .map((l, index) => ({
          id: l.id,
          nome: `${index + 1} - ${l.nome}`,
          latitude: l.latitude as number,
          longitude: l.longitude as number,
          ordem: index + 1,
        })),
    [selecionados]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nomeViagem || selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const body = {
        nome: nomeViagem,
        locaisIds: selectedIds,
      };

      const resp = await apiFetch("/api/motorista/viagens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        const data = await resp.json();
        router.push(`/motorista/viagens/${data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedPage allowedRoles={["MOTORISTA"]}>
      <AppLayout role="MOTORISTA">
        <div className="page-header">
          <div>
            <h1 className="page-title">Criar viagem</h1>
            <p className="page-subtitle">
              Selecione os locais de entrega e defina a ordem dos pontos.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
            gap: 16,
          }}
        >
          <div className="card">
            <h2 className="card-title">Configurações da viagem</h2>
            <p className="card-description">
              Informe um nome e escolha os locais que farão parte da rota.
            </p>

            <label className="field-label">Nome da viagem</label>
            <input
              className="input"
              value={nomeViagem}
              onChange={(e) => setNomeViagem(e.target.value)}
              placeholder="Ex.: Entregas turno da manhã"
              required
            />

            <h3
              style={{
                marginTop: 14,
                marginBottom: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Locais disponíveis
            </h3>

            {loadingLocais ? (
              <p className="card-description">Carregando locais...</p>
            ) : locais.length === 0 ? (
              <p className="card-description">
                Nenhum local disponível. Solicite ao administrador o cadastro
                dos pontos de entrega.
              </p>
            ) : (
              <div
                style={{
                  maxHeight: 260,
                  overflowY: "auto",
                  borderRadius: 10,
                  border: "1px solid var(--color-border-soft)",
                  padding: 6,
                  background: "#f9fbff",
                }}
              >
                {locais.map((local) => {
                  const checked = selectedIds.includes(local.id);
                  return (
                    <label
                      key={local.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 6px",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: checked ? "#e0efff" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocal(local.id)}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        >
                          {local.nome}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--color-text-soft)",
                          }}
                        >
                          {local.endereco}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !nomeViagem || selectedIds.length === 0}
              className="btn-primary"
              style={{ marginTop: 16 }}
            >
              {submitting ? "Criando viagem..." : "Criar viagem"}
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">Ordem dos pontos</h2>
            <p className="card-description">
              Ajuste a sequência dos locais. Essa ordem será usada para montar a
              rota.
            </p>

            {selecionados.length === 0 ? (
              <p className="card-description">
                Nenhum local selecionado. Marque os locais na coluna ao lado.
              </p>
            ) : (
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  marginBottom: 12,
                  borderRadius: 10,
                  border: "1px solid var(--color-border-soft)",
                }}
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Local</th>
                      <th>Endereço</th>
                      <th>Ajustar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selecionados.map((local, index) => (
                      <tr key={local.id}>
                        <td>{index + 1}</td>
                        <td>{local.nome}</td>
                        <td>{local.endereco}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                            }}
                          >
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() =>
                                moveSelected(local.id, "up")
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() =>
                                moveSelected(local.id, "down")
                              }
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3
              style={{
                marginTop: 8,
                marginBottom: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Pré-visualização da rota
            </h3>
            <RouteMap points={routePoints} />
          </div>
        </form>
      </AppLayout>
    </ProtectedPage>
  );
}
