"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProtectedPage } from "../../components/ProtectedPage";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../services/api";
import { GoogleMap } from "../../components/GoogleMap";

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

export default function DetalheViagemPage() {
  const { logout } = useAuth();
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
    () =>
      viagem?.pontos.find((p) => p.status === "PENDENTE") ?? null,
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

  const markers = useMemo(
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
            }))
        : [],
    [viagem]
  );

  return (
    <ProtectedPage allowedRoles={["MOTORISTA"]}>
      <div style={{ padding: 24 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h1>Detalhes da viagem</h1>
            <Link href="/motorista/viagens">Voltar para minhas viagens</Link>
          </div>
          <button onClick={logout}>Sair</button>
        </header>

        {loading ? (
          <p>Carregando...</p>
        ) : !viagem ? (
          <p>Viagem não encontrada.</p>
        ) : (
          <>
            <section style={{ marginBottom: 24 }}>
              <p>
                <strong>Nome:</strong> {viagem.nome}
              </p>
              <p>
                <strong>Status:</strong> {viagem.status}
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
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2>Pontos da rota</h2>
              {viagem.pontos.length === 0 ? (
                <p>Nenhum ponto cadastrado.</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 8,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        Ordem
                      </th>
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        Local
                      </th>
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        Endereço
                      </th>
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: 8,
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viagem.pontos.map((p) => (
                      <tr key={p.id}>
                        <td
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: 8,
                          }}
                        >
                          {p.ordem}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: 8,
                          }}
                        >
                          {p.localNome}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: 8,
                          }}
                        >
                          {p.localEndereco}
                        </td>
                        <td
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: 8,
                          }}
                        >
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {viagem.status === "EM_ANDAMENTO" && proximoPonto && (
                <button
                  onClick={marcarChegada}
                  disabled={updating}
                  style={{ marginTop: 16, padding: 8, minWidth: 260 }}
                >
                  {updating
                    ? "Atualizando..."
                    : `Cheguei no local ${proximoPonto.ordem} - ${proximoPonto.localNome}`}
                </button>
              )}

              {viagem.status === "CONCLUIDA" && (
                <p style={{ marginTop: 16 }}>
                  Viagem concluída. Todos os pontos foram visitados.
                </p>
              )}
            </section>

            <section>
              <h2>Mapa da rota</h2>
              <GoogleMap markers={markers} />
            </section>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
