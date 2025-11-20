"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  nome: string;
  status: StatusViagem;
  dataCriacao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  motoristaNome: string;
  pontos: PontoRota[];
};

export default function DetalheViagemMotoristaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function loadViagem() {
    if (!id) return;
    setLoading(true);
    try {
      const resp = await apiFetch(`/api/motorista/viagens/${id}`);
      if (resp.ok) {
        const data = await resp.json();
        setViagem(data);
      } else {
        setViagem(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadViagem();
  }, [id]);

  function formatDate(value: string | null) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR");
  }

  const proximoPonto = useMemo(
    () => viagem?.pontos.find((p) => p.status === "PENDENTE") ?? null,
    [viagem]
  );

  async function marcarChegada() {
    if (!viagem || !proximoPonto) return;
    setUpdating(true);
    try {
      const resp = await apiFetch(
        `/api/motorista/viagens/${viagem.id}/pontos/${proximoPonto.id}/visitar`,
        {
          method: "POST",
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        setViagem(data);
      }
    } finally {
      setUpdating(false);
    }
  }

  function statusClass(status: StatusViagem) {
    if (status === "PLANEJADA") return "badge-status planejada";
    if (status === "EM_ANDAMENTO") return "badge-status em-andamento";
    return "badge-status concluida";
  }

  const routePoints = useMemo(
    () =>
      viagem
        ? viagem.pontos
            .filter(
              (p) =>
                p.latitude !== null &&
                !Number.isNaN(p.latitude) &&
                p.longitude !== null &&
                !Number.isNaN(p.longitude)
            )
            .map((p) => ({
              id: p.id,
              nome: `${p.ordem} - ${p.localNome}`,
              latitude: p.latitude as number,
              longitude: p.longitude as number,
              ordem: p.ordem,
            }))
        : [],
    [viagem]
  );

  return (
    <ProtectedPage allowedRoles={["MOTORISTA"]}>
      <AppLayout role="MOTORISTA">
        <div className="page-header">
          <div>
            <h1 className="page-title">Detalhes da viagem</h1>
            <p className="page-subtitle">
              Avance pelos pontos e acompanhe a rota no mapa.
            </p>
          </div>
          <Link href="/motorista/viagens" className="btn-ghost">
            Voltar
          </Link>
        </div>

        {loading ? (
          <div className="card">
            <p className="card-description">Carregando...</p>
          </div>
        ) : !viagem ? (
          <div className="card">
            <p className="card-description">Viagem não encontrada.</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div className="card">
                <h2 className="card-title">Informações da viagem</h2>
                <p className="card-description">
                  Verifique o status atual antes de avançar para o próximo ponto.
                </p>
                <p>
                  <strong>Nome:</strong> {viagem.nome}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={statusClass(viagem.status)}>
                    {viagem.status === "EM_ANDAMENTO"
                      ? "Em andamento"
                      : viagem.status === "PLANEJADA"
                      ? "Planejada"
                      : "Concluída"}
                  </span>
                </p>
                <p>
                  <strong>Criada em:</strong> {formatDate(viagem.dataCriacao)}
                </p>
                <p>
                  <strong>Início:</strong> {formatDate(viagem.dataInicio)}
                </p>
                <p>
                  <strong>Fim:</strong> {formatDate(viagem.dataFim)}
                </p>

                {viagem.status === "EM_ANDAMENTO" && proximoPonto && (
                  <button
                    onClick={marcarChegada}
                    disabled={updating}
                    className="btn-primary"
                    style={{ marginTop: 16 }}
                  >
                    {updating
                      ? "Atualizando..."
                      : `Cheguei no local ${proximoPonto.ordem} - ${proximoPonto.localNome}`}
                  </button>
                )}

                {viagem.status === "CONCLUIDA" && (
                  <p style={{ marginTop: 12, fontSize: "0.85rem" }}>
                    Todos os pontos foram visitados. Viagem concluída.
                  </p>
                )}
              </div>

              <div className="card">
                <h2 className="card-title">Pontos da rota</h2>
                {viagem.pontos.length === 0 ? (
                  <p className="card-description">Nenhum ponto cadastrado.</p>
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
                      {viagem.pontos.map((p) => (
                        <tr key={p.id}>
                          <td>{p.ordem}</td>
                          <td>{p.localNome}</td>
                          <td>{p.localEndereco}</td>
                          <td>{p.status === "VISITADO" ? "Visitado" : "Pendente"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Mapa da rota</h2>
              <RouteMap points={routePoints} />
            </div>
          </>
        )}
      </AppLayout>
    </ProtectedPage>
  );
}
