"use client";

import { ProtectedPage } from "../components/ProtectedPage";
import { AppLayout } from "../components/AppLayout";

export default function AdminDashboardPage() {
  return (
    <ProtectedPage allowedRoles={["ADMIN"]}>
      <AppLayout role="ADMIN">
        <div className="page-header">
          <div>
            <h1 className="page-title">Visão geral do administrador</h1>
            <p className="page-subtitle">
              Em breve esta página exibirá gráficos e indicadores das viagens.
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Bem-vindo ao painel TripFlow</h2>
          <p className="card-description">
            Esta é a rota inicial do administrador após o login. Use o menu lateral
            para acessar o cadastro de locais, viagens e demais funcionalidades.
          </p>
        </div>
      </AppLayout>
    </ProtectedPage>
  );
}
