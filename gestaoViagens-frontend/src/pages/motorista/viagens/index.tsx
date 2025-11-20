"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { AppLayout } from "../../../components/AppLayout";
import { apiFetch } from "../../../services/api";

type PontoRota = {
  id: number;
  ordem: number;
  status: string;
  localId: number | null;
  localNome: string | null;
  localEndereco: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Viagem = {
  id: number;
  nome: string;
  status: string;
  dataCriacao: string;
  dataInicio: string | null;
  dataFim: string | null;
  motoristaNome: string | null;
  pontos: PontoRota[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatStatus(status: string) {
  switch (status) {
    case "PLANEJADA":
      return "Planejada";
    case "EM_ANDAMENTO":
      return "Em andamento";
    case "CONCLUIDA":
      return "Concluída";
    default:
      return status;
  }
}

export default function MotoristaViagensPage() {
  const router = useRouter();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const resp = await apiFetch("/api/motorista/viagens");
        if (resp.ok) {
          const data = (await resp.json()) as Viagem[];
          setViagens(data);
        } else {
          setViagens([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ProtectedPage allowedRoles={["MOTORISTA"]}>
      <AppLayout role="MOTORISTA">
        <div className="page-header">
          <div>
            <h1 className="page-title">Minhas viagens</h1>
            <p className="page-subtitle">
              Crie novas viagens e acompanhe o status das rotas planejadas.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push("/motorista/viagens/nova")}
          >
            Nova viagem
          </button>
        </div>

        <div className="card">
          <h2 className="card-title">Lista de viagens</h2>

          {loading ? (
            <p className="card-description">Carregando viagens...</p>
          ) : viagens.length === 0 ? (
            <p className="card-description">
              Você ainda não possui viagens cadastradas.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Criada em</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Pontos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((v) => (
                  <tr key={v.id}>
                    <td>{v.nome}</td>
                    <td>{formatStatus(v.status)}</td>
                    <td>{formatDate(v.dataCriacao)}</td>
                    <td>{formatDate(v.dataInicio)}</td>
                    <td>{formatDate(v.dataFim)}</td>
                    <td>{v.pontos?.length ?? 0}</td>
                    <td>
                      <Link
                        href={`/motorista/viagens/${v.id}`}
                        className="btn-secondary"
                      >
                        Abrir
                      </Link>
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
