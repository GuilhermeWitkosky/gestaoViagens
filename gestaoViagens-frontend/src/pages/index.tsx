"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "../components/ProtectedPage";
import { AppLayout } from "../components/AppLayout";
import { apiFetch } from "../services/api";

type StatusViagem = "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA";

type DashboardViagemItem = {
  id: number;
  nome: string | null;
  motoristaNome: string;
  status: StatusViagem;
  dataCriacao: string;
  dataInicio: string | null;
  dataFim: string | null;
  totalPontos: number;
  pontosVisitados: number;
};

type DashboardResumo = {
  totalViagens: number;
  totalPlanejadas: number;
  totalEmAndamento: number;
  totalConcluidas: number;
  viagensEmAndamento: DashboardViagemItem[];
  ultimasViagensConcluidas: DashboardViagemItem[];
  viagensPorMotoristaUltimos30Dias: {
    motoristaId: number;
    motoristaNome: string;
    quantidadeViagens: number;
  }[];
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

function getStatusBadge(status: StatusViagem) {
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

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadDashboard() {
    try {
      if (!dashboard) {
        setLoading(true);
      }
      setError(null);
      const resp = await apiFetch("/api/admin/viagens/dashboard");
      if (!resp.ok) {
        setError("Erro ao carregar dados do dashboard.");
        setDashboard(null);
        return;
      }
      const data = (await resp.json()) as DashboardResumo;
      setDashboard(data);
      setLastUpdated(new Date());
    } catch {
      setError("Erro ao carregar dados do dashboard.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // atualização a cada 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Visão geral das viagens</h1>
            <p className="page-subtitle">
              Acompanhe em tempo quase real as corridas em andamento e o
              histórico de viagens concluídas.
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
            {lastUpdated && (
              <p style={{ margin: 0, color: "#6b7280" }}>
                Última atualização:{" "}
                {lastUpdated.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            )}
            <button
              type="button"
              className="btn-ghost"
              onClick={loadDashboard}
              style={{ marginTop: 6 }}
            >
              Recarregar agora
            </button>
          </div>
        </div>

        {loading && !dashboard ? (
          <p className="card-description">Carregando indicadores...</p>
        ) : error ? (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.9rem",
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        ) : null}

        <section className="form-grid">
          <div className="card">
            <h2 className="card-title">Resumo das viagens</h2>
            <p className="card-description">
              Indicadores gerais das viagens planejadas, em andamento e
              concluídas.
            </p>

            {dashboard && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Total Viagens</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {dashboard.totalViagens}
                  </p>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Planejadas</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {dashboard.totalPlanejadas}
                  </p>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Em andamento</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {dashboard.totalEmAndamento}
                  </p>
                </div>
                <div className="card" style={{ padding: 12 }}>
                  <p className="field-label">Concluídas</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {dashboard.totalConcluidas}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Viagens em andamento</h2>
            <p className="card-description">
              Corridas atualmente em andamento.
            </p>

            {!dashboard || dashboard.viagensEmAndamento.length === 0 ? (
              <p className="card-description" style={{ marginTop: 12 }}>
                Nenhuma viagem em andamento no momento.
              </p>
            ) : (
              <table className="table table-viagens">
                <thead>
                  <tr>
                    <th>Viagem</th>
                    <th>Motorista</th>
                    <th>Status</th>
                    <th>Progresso</th>
                    <th>Início</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.viagensEmAndamento.map((v) => {
                    const statusInfo = getStatusBadge(v.status);
                    const nome =
                      v.nome && v.nome.trim().length > 0
                        ? v.nome
                        : `Viagem #${v.id}`;
                    const progresso =
                      v.totalPontos > 0
                        ? `${v.pontosVisitados} / ${v.totalPontos}`
                        : "-";

                    return (
                      <tr key={v.id}>
                        <td>{nome}</td>
                        <td>{v.motoristaNome}</td>
                        <td>
                          <span className={statusInfo.className}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>{progresso}</td>
                        <td>{formatDateTime(v.dataInicio)}</td>
                        <td>
                          <Link
                            href={`/admin/viagens/${v.id}`}
                            className="link"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Últimas viagens concluídas</h2>
            <p className="card-description">
              Histórico recente de viagens finalizadas.
            </p>

            {!dashboard || dashboard.ultimasViagensConcluidas.length === 0 ? (
              <p className="card-description" style={{ marginTop: 12 }}>
                Ainda não há viagens concluídas.
              </p>
            ) : (
              <table className="table table-viagens">
                <thead>
                  <tr>
                    <th>Viagem</th>
                    <th>Motorista</th>
                    <th>Progresso</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.ultimasViagensConcluidas.map((v) => {
                    const nome =
                      v.nome && v.nome.trim().length > 0
                        ? v.nome
                        : `Viagem #${v.id}`;
                    const progresso =
                      v.totalPontos > 0
                        ? `${v.pontosVisitados} / ${v.totalPontos}`
                        : "-";

                    return (
                      <tr key={v.id}>
                        <td>{nome}</td>
                        <td>{v.motoristaNome}</td>
                        <td>{progresso}</td>
                        <td>{formatDateTime(v.dataInicio)}</td>
                        <td>{formatDateTime(v.dataFim)}</td>
                        <td>
                          <Link
                            href={`/admin/viagens/${v.id}`}
                            className="link"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="card">
            <h2 className="card-title">
              Viagens por motorista (últimos 30 dias)
            </h2>
            <p className="card-description">
              Quantidade de viagens criadas por motorista nos últimos 30 dias.
            </p>

            {!dashboard ||
            dashboard.viagensPorMotoristaUltimos30Dias.length === 0 ? (
              <p className="card-description" style={{ marginTop: 12 }}>
                Ainda não há viagens registradas nos últimos 30 dias.
              </p>
            ) : (
              <div style={{ marginTop: 14 }}>
                {(() => {
                  const items =
                    dashboard.viagensPorMotoristaUltimos30Dias || [];
                  const max =
                    items.reduce(
                      (acc, item) =>
                        item.quantidadeViagens > acc
                          ? item.quantidadeViagens
                          : acc,
                      0
                    ) || 1;

                  return items.map((item) => {
                    const percent = (item.quantidadeViagens / max) * 100;

                    return (
                      <div
                        key={item.motoristaId}
                        className="chart-bar-row"
                      >
                        <span className="chart-bar-label">
                          {item.motoristaNome}
                        </span>
                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="chart-bar-value">
                          {item.quantidadeViagens}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

        </section>
      </AppLayout>
    </ProtectedPage>
  );
}
