package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.StatusPontoRota;

public record PontoRotaResponse(
        Long id,
        Integer ordem,
        StatusPontoRota status,
        Long localId,
        String localNome,
        String localEndereco,
        Double latitude,
        Double longitude
) {
}
