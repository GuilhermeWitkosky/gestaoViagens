package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.StatusViagem;

import java.time.LocalDateTime;
import java.util.List;

public record ViagemResponse(
        Long id,
        String nome,
        StatusViagem status,
        LocalDateTime dataCriacao,
        LocalDateTime dataInicio,
        LocalDateTime dataFim,
        String motoristaNome,
        List<PontoRotaResponse> pontos
) {
}
