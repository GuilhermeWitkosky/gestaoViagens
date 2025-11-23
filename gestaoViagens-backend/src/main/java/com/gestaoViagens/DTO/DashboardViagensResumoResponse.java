package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.StatusViagem;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardViagensResumoResponse(
        long totalViagens,
        long totalPlanejadas,
        long totalEmAndamento,
        long totalConcluidas,
        List<DashboardViagemItem> viagensEmAndamento,
        List<DashboardViagemItem> ultimasViagensConcluidas,
        List<ViagensPorMotoristaItem> viagensPorMotoristaUltimos30Dias
) {

    public record DashboardViagemItem(
            Long id,
            String nome,
            String motoristaNome,
            StatusViagem status,
            LocalDateTime dataCriacao,
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            int totalPontos,
            int pontosVisitados
    ) {
    }

    public record ViagensPorMotoristaItem(
            Long motoristaId,
            String motoristaNome,
            long quantidadeViagens
    ) {
    }
}
