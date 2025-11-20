package com.gestaoViagens.DTO;

import com.gestaoViagens.ENUM.Role;

public record MeResponse(
        String email,
        Role role
) {
}
