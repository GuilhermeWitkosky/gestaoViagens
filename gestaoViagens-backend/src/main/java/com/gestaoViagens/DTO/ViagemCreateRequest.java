package com.gestaoViagens.DTO;

import java.util.List;

public record ViagemCreateRequest(
        String nome,
        List<Long> locaisIds,
        Long motoristaId
) {
}
