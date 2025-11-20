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

export default function AdminViagemDetalhesPage() {
  const router = useRouter();
  const { id } = router.query;
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadViagem() {
    setLoading(true);
    try {
      const resp = await apiFetch(`/api/admin/viagens/${id}`);
      if (resp.ok) {
        const data = await resp.json();
        setViagem(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadViagem();
    }
  }, [id]);

  async function updateStatus(status: StatusViagem) {
    const resp = await apiFetch(`/api/admin/viagens/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (resp.ok) {
      loadViagem();
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!viagem) {
    return <div>Viagem não encontrada.</div>;
  }

  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">{viagem.nome}</h1>
            <p className="page-subtitle">Detalhes da viagem</p>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Detalhes da viagem</h2>

          <p><strong>Status: </strong>{viagem.status}</p>
          <p><strong>Motorista: </strong>{viagem.motoristaNome}</p>
          <p><strong>Data de Criação: </strong>{viagem.dataCriacao}</p>
          <p><strong>Data de Início: </strong>{viagem.dataInicio}</p>
          <p><strong>Data de Fim: </strong>{viagem.dataFim}</p>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => updateStatus("EM_ANDAMENTO")}
              disabled={viagem.status === "EM_ANDAMENTO"}
            >
              Iniciar Viagem
            </button>
            <button
              onClick={() => updateStatus("CONCLUIDA")}
              disabled={viagem.status === "CONCLUIDA"}
            >
              Concluir Viagem
            </button>
            <button
              onClick={() => updateStatus("PLANEJADA")}
              disabled={viagem.status === "PLANEJADA"}
            >
              Reverter para Planejada
            </button>
          </div>
        </div>
      </AppLayout>
    </ProtectedPage>
  );
}
