"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { AppLayout } from "../../../components/AppLayout";
import { apiFetch } from "../../../services/api";

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

export default function AdminViagensPage() {
  const router = useRouter();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadViagens() {
    setLoading(true);
    const url = router.pathname.includes("admin") ? "/api/admin/viagens" : "/api/motorista/viagens";
    try {
      const resp = await apiFetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setViagens(data);
      } else {
        setViagens([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadViagens();
    const interval = setInterval(() => {
      loadViagens();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  function formatDate(value: string | null) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR");
  }

  function statusClass(status: StatusViagem) {
    if (status === "PLANEJADA") return "badge-status planejada";
    if (status === "EM_ANDAMENTO") return "badge-status em-andamento";
    return "badge-status concluida";
  }

  return (
    <ProtectedPage allowedRoles={["ADMIN", "MOTORISTA"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Viagens</h1>
            <p className="page-subtitle">
              Acompanhe todas as viagens criadas pelos motoristas.
            </p>
          </div>
          <div>
            <button
              className="btn-primary"
              onClick={() => router.push("/admin/viagens/nova")}
            >
              Criar Nova Viagem
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Lista de viagens</h2>
          {loading ? (
            <p className="card-description">Carregando...</p>
          ) : viagens.length === 0 ? (
            <p className="card-description">Nenhuma viagem registrada.</p>
          ) : (
            <table className="table table-viagens">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Motorista</th>
                  <th>Status</th>
                  <th>Criada em</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Pontos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((v) => (
                  <tr key={v.id}>
                    <td>{v.nome}</td>
                    <td>{v.motoristaNome}</td>
                    <td>
                      <span className={statusClass(v.status)}>
                        {v.status === "EM_ANDAMENTO"
                          ? "Em andamento"
                          : v.status === "PLANEJADA"
                          ? "Planejada"
                          : "Concluída"}
                      </span>
                    </td>
                    <td>{formatDate(v.dataCriacao)}</td>
                    <td>{formatDate(v.dataInicio)}</td>
                    <td>{formatDate(v.dataFim)}</td>
                    <td>{v.pontos.length}</td>
                    <td>
                      <button
                        className="btn-ghost"
                        onClick={() =>
                          router.push(`/admin/viagens/${v.id}`)
                        }
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AppLayout>
    </ProtectedPage>
  );
}
