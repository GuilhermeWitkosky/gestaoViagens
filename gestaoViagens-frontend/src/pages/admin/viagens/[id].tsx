"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { AppLayout } from "../../../components/AppLayout";
import { apiFetch } from "../../../services/api";
import { RouteMap } from "../../../components/RouteMap";

type StatusViagem = "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA";

type PontoRota = {
  id: number;
  ordem: number;
  status: "PENDENTE" | "VISITADO";
  localId: number;
  localNome: string;
  localEndereco: string;
  latitude: number | null;
  longitude: number | null;
};

type Viagem = {
  id: number;
  nome: string | null;
  status: StatusViagem;
  dataCriacao: string;
  dataInicio: string | null;
  dataFim: string | null;
  motoristaNome: string;
  pontos: PontoRota[];
};

type RoutePoint = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  ordem: number;
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status: StatusViagem) {
  switch (status) {
    case "PLANEJADA":
      return { label: "Planejada", className: "badge-status planejada" };
    case "EM_ANDAMENTO":
      return { label: "Em andamento", className: "badge-status em-andamento" };
    case "CONCLUIDA":
      return { label: "Concluída", className: "badge-status concluida" };
    default:
      return { label: status, className: "badge-status planejada" };
  }
}

export default function AdminViagemDetalhesPage() {
  const router = useRouter();
  const { id } = router.query;

  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const viagemId = Array.isArray(id) ? id[0] : id;

  async function fetchViagemById(currentId: string) {
    setLoading(true);
    try {
      const resp = await apiFetch(`/api/admin/viagens/${currentId}`);
      if (resp.ok) {
        const data = (await resp.json()) as Viagem;
        setViagem(data);
      } else {
        setViagem(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!viagemId) return;
    fetchViagemById(viagemId);
  }, [viagemId]);

  const pontosVisitados = useMemo(
    () => viagem?.pontos.filter((p) => p.status === "VISITADO").length ?? 0,
    [viagem]
  );

  const totalPontos = viagem?.pontos.length ?? 0;

  const proximoPonto = useMemo(
    () => viagem?.pontos.find((p) => p.status === "PENDENTE") ?? null,
    [viagem]
  );

  const routePoints: RoutePoint[] = useMemo(() => {
    if (!viagem) return [];
    return viagem.pontos
      .filter(
        (p) =>
          p.latitude != null &&
          p.longitude != null &&
          !Number.isNaN(p.latitude) &&
          !Number.isNaN(p.longitude)
      )
      .sort((a, b) => a.ordem - b.ordem)
      .map((p) => ({
        id: p.id,
        nome: p.localNome,
        latitude: p.latitude as number,
        longitude: p.longitude as number,
        ordem: p.ordem,
      }));
  }, [viagem]);

  async function handleIniciarViagem() {
    if (!viagemId) return;
    setUpdating(true);
    try {
      const resp = await apiFetch(`/api/admin/viagens/${viagemId}/iniciar`, {
        method: "POST",
      });
      if (resp.ok) {
        await fetchViagemById(viagemId);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleMarcarChegada() {
    if (!viagem || !proximoPonto) return;
    setUpdating(true);
    try {
      const resp = await apiFetch(
        `/api/admin/viagens/${viagem.id}/pontos/${proximoPonto.id}/visitar`,
        {
          method: "POST",
        }
      );
      if (resp.ok) {
        const data = (await resp.json()) as Viagem;
        setViagem(data);
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading && !viagem) {
    return (
      <ProtectedPage allowedRoles={["ADMIN"]}>
        <AppLayout role="ADMIN">
          <div className="page-header">
            <h1 className="page-title">Detalhes da viagem</h1>
            <p className="page-subtitle">Carregando informações...</p>
          </div>
        </AppLayout>
      </ProtectedPage>
    );
  }

  if (!viagem) {
    return (
      <ProtectedPage allowedRoles={["ADMIN"]}>
        <AppLayout role="ADMIN">
          <div className="page-header">
            <h1 className="page-title">Viagem não encontrada</h1>
            <p className="page-subtitle">
              Verifique se a viagem ainda existe ou se o endereço está correto.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => router.push("/admin/viagens")}
          >
            Voltar para lista de viagens
          </button>
        </AppLayout>
      </ProtectedPage>
    );
  }

  const statusInfo = getStatusInfo(viagem.status);

  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <p className="page-subtitle">
              <Link href="/admin/viagens">&larr; Voltar para viagens</Link>
            </p>
            <h1 className="page-title">
              {viagem.nome && viagem.nome.trim().length > 0
                ? viagem.nome
                : `Viagem #${viagem.id}`}
            </h1>
            <p className="page-subtitle">
              Motorista: <strong>{viagem.motoristaNome}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>
              {statusInfo && (
                <span className={statusInfo.className}>{statusInfo.label}</span>
              )}
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Criada em {formatDateTime(viagem.dataCriacao)}
            </p>
          </div>
        </div>

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">Resumo da viagem</h2>
            <p className="card-description">
              Acompanhe o andamento da rota e os pontos já visitados.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginTop: 12,
              }}
            >
              <div>
                <p className="field-label">Status</p>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {statusInfo.label}
                </p>
              </div>
              <div>
                <p className="field-label">Pontos visitados</p>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {pontosVisitados} / {totalPontos}
                </p>
              </div>
              <div>
                <p className="field-label">Próximo ponto</p>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {proximoPonto
                    ? `${proximoPonto.ordem}º - ${proximoPonto.localNome}`
                    : "Todos os pontos foram visitados"}
                </p>
              </div>
              <div>
                <p className="field-label">Início</p>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {formatDateTime(viagem.dataInicio)}
                </p>
              </div>
              <div>
                <p className="field-label">Conclusão</p>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {formatDateTime(viagem.dataFim)}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn-primary"
                disabled={viagem.status !== "PLANEJADA" || updating}
                onClick={handleIniciarViagem}
              >
                {updating && viagem.status === "PLANEJADA"
                  ? "Atualizando..."
                  : viagem.status === "PLANEJADA"
                  ? "Iniciar viagem"
                  : "Viagem já iniciada"}
              </button>

              {viagem.status === "EM_ANDAMENTO" && (
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={!proximoPonto || updating}
                  onClick={handleMarcarChegada}
                >
                  {updating
                    ? "Atualizando..."
                    : proximoPonto
                    ? `Marcar chegada no ${proximoPonto.ordem}º ponto`
                    : "Todos os pontos visitados"}
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Pontos da rota</h2>
            {viagem.pontos.length === 0 ? (
              <p className="card-description">
                Nenhum ponto de rota cadastrado para esta viagem.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Ordem</th>
                    <th>Local</th>
                    <th>Endereço</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viagem.pontos
                    .slice()
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((ponto) => (
                      <tr key={ponto.id}>
                        <td>{ponto.ordem}º</td>
                        <td>{ponto.localNome}</td>
                        <td>{ponto.localEndereco}</td>
                        <td>
                          {ponto.status === "VISITADO"
                            ? "Visitado"
                            : "Pendente"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Mapa da rota</h2>
            {routePoints.length === 0 ? (
              <p className="card-description">
                Não há coordenadas suficientes para montar a rota no mapa.
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
