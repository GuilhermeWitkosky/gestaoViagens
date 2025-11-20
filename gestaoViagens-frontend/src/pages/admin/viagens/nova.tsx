import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { GoogleMap } from "../../../components/GoogleMap";
import { apiFetch } from "../../../services/api";

type Local = {
  id: number;
  nome: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
};

type Motorista = {
  id: number;
  nome: string;
  email: string;
};

export default function AdminNovaViagemPage() {
  const router = useRouter();
  const [locais, setLocais] = useState<Local[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [motoristaId, setMotoristaId] = useState<number | "">("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [locaisResp, motoristasResp] = await Promise.all([
          apiFetch("/api/admin/locais"),
          apiFetch("/api/admin/usuarios/motoristas"),
        ]);

        if (locaisResp.ok) {
          const data = (await locaisResp.json()) as Local[];
          setLocais(data);
        }

        if (motoristasResp.ok) {
          const data = (await motoristasResp.json()) as Motorista[];
          setMotoristas(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!motoristaId) {
      setError("Selecione um motorista para a viagem.");
      return;
    }

    if (selectedIds.length < 2) {
      setError("Selecione pelo menos dois locais para a viagem.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        nome: nome.trim().length > 0 ? nome.trim() : null,
        locaisIds: selectedIds,
        motoristaId: motoristaId,
      };

      const resp = await apiFetch("/api/admin/viagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        setError("Erro ao criar viagem. Tente novamente.");
        return;
      }

      const data = (await resp.json()) as { id: number };
      router.push(`/admin/viagens/${data.id}`);
    } catch {
      setError("Erro ao criar viagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Criar Nova Viagem</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={motoristaId}
          onChange={(e) => setMotoristaId(Number(e.target.value))}
        >
          {motoristas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        <div>
          {locais.map((local) => (
            <label key={local.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(local.id)}
                onChange={() =>
                  setSelectedIds((prev) =>
                    prev.includes(local.id)
                      ? prev.filter((id) => id !== local.id)
                      : [...prev, local.id]
                  )
                }
              />
              {local.nome}
            </label>
          ))}
        </div>

        <button type="submit">Criar Viagem</button>
      </form>

      {selectedIds.length > 0 && (
        <div>
          <GoogleMap
            markers={locais
              .filter((local) => selectedIds.includes(local.id))
              .filter((local) => local.latitude !== null && local.longitude !== null)
              .map((local) => ({
                ...local,
                latitude: local.latitude as number,
                longitude: local.longitude as number,
              }))}
          />
        </div>
      )}
    </div>
  );
}
