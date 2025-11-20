package com.gestaoViagens.DTO;

import java.util.List;

public record CriarViagemRequest(
        String nome,
        List<Long> locaisIds
) {
}
