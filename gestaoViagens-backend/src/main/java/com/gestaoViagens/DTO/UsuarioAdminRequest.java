package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.Role;

public record UsuarioAdminRequest(
        String nome,
        String email,
        String senha,
        Role role
) {
}
