package com.gestaoViagens.service;

import com.gestaoViagens.DTO.UsuarioAdminRequest;
import com.gestaoViagens.DTO.UsuarioAdminResponse;
import com.gestaoViagens.DTO.UsuarioMotoristaResumoResponse;
import com.gestaoViagens.ENUM.Role;
import com.gestaoViagens.entity.Usuario;
import com.gestaoViagens.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioAdminService(UsuarioRepository usuarioRepository,
                               PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioAdminResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UsuarioAdminResponse criar(UsuarioAdminRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("E-mail já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setRole(request.role());
        usuario.setAtivo(true);

        Usuario salvo = usuarioRepository.save(usuario);
        return toResponse(salvo);
    }

    private UsuarioAdminResponse toResponse(Usuario usuario) {
        return new UsuarioAdminResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole(),
                usuario.isAtivo()
        );
    }

    @Transactional(readOnly = true)
    public List<UsuarioMotoristaResumoResponse> listarMotoristasAtivos() {
        return usuarioRepository.findByRoleAndAtivoTrue(Role.MOTORISTA)
                .stream()
                .map(u -> new UsuarioMotoristaResumoResponse(
                        u.getId(),
                        u.getNome(),
                        u.getEmail()
                ))
                .toList();
    }
}
