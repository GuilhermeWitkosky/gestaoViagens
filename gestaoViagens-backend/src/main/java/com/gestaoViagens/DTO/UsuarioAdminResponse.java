package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.Role;

public record UsuarioAdminResponse(
        Long id,
        String nome,
        String email,
        Role role,
        boolean ativo
) {
}
