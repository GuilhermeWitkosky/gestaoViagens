package com.gestaoViagens.DTO;

public record LocalResponse(
        Long id,
        String nome,
        String endereco,
        Double latitude,
        Double longitude,
        String observacoes,
        boolean ativo
) {
}
