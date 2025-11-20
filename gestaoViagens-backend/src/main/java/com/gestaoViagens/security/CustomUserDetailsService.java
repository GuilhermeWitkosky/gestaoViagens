package com.gestaoViagens.security;

import com.gestaoViagens.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByEmailAndAtivoTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name()));

        return new User(
                usuario.getEmail(),
                usuario.getSenha(),
                usuario.isAtivo(),
                true,
                true,
                true,
                authorities
        );
    }
}
