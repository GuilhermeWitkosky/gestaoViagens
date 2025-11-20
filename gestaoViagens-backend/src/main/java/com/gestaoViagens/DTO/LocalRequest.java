package com.gestaoViagens.DTO;

public record LocalRequest(
        String nome,
        String endereco,
        Double latitude,
        Double longitude,
        String observacoes
) {
}
