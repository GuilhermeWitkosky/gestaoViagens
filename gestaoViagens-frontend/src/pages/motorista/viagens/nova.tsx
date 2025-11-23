"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { AppLayout } from "../../../components/AppLayout";
import { apiFetch } from "../../../services/api";
import { RouteMap } from "../../../components/RouteMap";

type Local = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  observacoes?: string | null;
  ativo?: boolean;
};

type ViagemCreateResponse = {
  id: number;
};

export default function NovaViagemMotoristaPage() {
  const router = useRouter();

  const [locais, setLocais] = useState<Local[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [nome, setNome] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const [loadingLocais, setLoadingLocais] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocais() {
      setLoadingLocais(true);
      try {
        // reutiliza os locais cadastrados pelo admin
        const resp = await apiFetch("/api/admin/locais");
        if (resp.ok) {
          const data = (await resp.json()) as Local[];
          // usa apenas locais ativos, se o backend devolver esse campo
          const ativos = data.filter((l) => l.ativo !== false);
          setLocais(ativos);
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

  function reorderSelectedIds(fromId: number, toId: number) {
    setSelectedIds((prev) => {
      const fromIndex = prev.indexOf(fromId);
      const toIndex = prev.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return prev;
      }
      const newOrder = [...prev];
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, fromId);
      return newOrder;
    });
  }

  const filteredLocais = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const base = [...locais].sort((a, b) => a.nome.localeCompare(b.nome));
    if (!term) return base;
    return base.filter((local) => local.nome.toLowerCase().includes(term));
  }, [locais, searchTerm]);

  const selectedLocaisOrdered = useMemo(() => {
    return selectedIds
      .map((id) => locais.find((l) => l.id === id) || null)
      .filter((l): l is Local => l !== null);
  }, [selectedIds, locais]);

  const routePoints = useMemo(() => {
    return selectedLocaisOrdered
      .filter(
        (local) =>
          local.latitude != null &&
          local.longitude != null &&
          !Number.isNaN(local.latitude) &&
          !Number.isNaN(local.longitude)
      )
      .map((local, index) => ({
        id: local.id,
        nome: local.nome,
        latitude: local.latitude as number,
        longitude: local.longitude as number,
        ordem: index + 1,
      }));
  }, [selectedLocaisOrdered]);

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
        motoristaId: null, // backend usa o motorista logado
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

      const data = (await resp.json()) as ViagemCreateResponse;
      if (data && data.id) {
        router.push(`/motorista/viagens/${data.id}`);
      } else {
        router.push("/motorista/viagens");
      }
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
            <p className="page-subtitle">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => router.push("/motorista/viagens")}
              >
                &larr; Voltar para minhas viagens
              </button>
            </p>
            <h1 className="page-title">Nova viagem</h1>
            <p className="page-subtitle">
              Selecione os locais que farão parte da rota e defina a ordem de
              visita.
            </p>
          </div>
        </div>

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">Dados da viagem</h2>
            <p className="card-description">
              Dê um nome à viagem (opcional), escolha os locais e organize a
              ordem em que serão visitados.
            </p>

            {loadingLocais ? (
              <p className="card-description" style={{ marginTop: 12 }}>
                Carregando locais...
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="field-label">Nome da viagem (opcional)</label>
                <input
                  className="input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Rota de entregas da manhã"
                />

                <label className="field-label" style={{ marginTop: 10 }}>
                  Buscar local
                </label>
                <input
                  className="input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite parte do nome do local"
                />

                <label className="field-label" style={{ marginTop: 10 }}>
                  Locais disponíveis
                </label>
                {locais.length === 0 ? (
                  <p className="card-description">
                    Nenhum local disponível. Peça para o administrador cadastrar
                    locais.
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
                    {filteredLocais.length === 0 ? (
                      <p
                        className="card-description"
                        style={{ marginBottom: 0 }}
                      >
                        Nenhum local encontrado para o termo digitado.
                      </p>
                    ) : (
                      filteredLocais.map((local) => {
                        const checked = selectedIds.includes(local.id);
                        const nomeCurto =
                          local.nome.length > 22
                            ? local.nome.slice(0, 22) + "..."
                            : local.nome;
                        const enderecoCurto =
                          local.endereco.length > 40
                            ? local.endereco.slice(0, 40) + "..."
                            : local.endereco;

                        return (
                          <label
                            key={local.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "4px 2px",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              backgroundColor: checked
                                ? "rgba(59,130,246,0.08)"
                                : "transparent",
                              borderRadius: 6,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLocal(local.id)}
                              style={{ marginTop: 3 }}
                            />
                            <span>
                              <strong>{nomeCurto}</strong>
                              <br />
                              <span style={{ opacity: 0.8 }}>
                                {enderecoCurto}
                              </span>
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    Locais selecionados e ordem da rota
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      marginBottom: 6,
                    }}
                  >
                    Arraste os itens para definir a ordem da rota. A primeira
                    posição será o primeiro local a ser visitado.
                  </p>

                  {selectedLocaisOrdered.length === 0 ? (
                    <p className="card-description">
                      Nenhum local selecionado ainda.
                    </p>
                  ) : (
                    <div
                      style={{
                        maxHeight: 200,
                        overflowY: "auto",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        padding: 8,
                      }}
                    >
                      {selectedLocaisOrdered.map((local, index) => (
                        <div
                          key={local.id}
                          draggable
                          onDragStart={() => setDraggingId(local.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (
                              draggingId !== null &&
                              draggingId !== local.id
                            ) {
                              reorderSelectedIds(draggingId, local.id);
                            }
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #e5e7eb",
                            backgroundColor:
                              draggingId === local.id
                                ? "rgba(59,130,246,0.12)"
                                : "white",
                            marginBottom: 6,
                            cursor: "grab",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#4b5563",
                              minWidth: 40,
                            }}
                          >
                            {index + 1}º
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontSize: "0.85rem",
                            }}
                          >
                            {local.nome}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                  disabled={
                    submitting ||
                    loadingLocais ||
                    selectedIds.length < 2
                  }
                  style={{ marginTop: 16 }}
                >
                  {submitting ? "Criando viagem..." : "Criar viagem"}
                </button>
              </form>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Pré-visualização da rota</h2>
            <p className="card-description">
              O mapa abaixo mostra a rota estimada entre os locais selecionados,
              na ordem definida na lista ao lado.
            </p>

            {routePoints.length < 2 ? (
              <p className="card-description" style={{ marginTop: 12 }}>
                Selecione e ordene pelo menos dois locais com coordenadas para
                visualizar a rota.
              </p>
            ) : (
              <RouteMap points={routePoints} />
            )}
          </div>
        </section>
      </AppLayout>
    </ProtectedPage>
  );
}
