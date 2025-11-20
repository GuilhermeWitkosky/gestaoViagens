package com.gestaoViagens.config;

import com.gestaoViagens.ENUM.Role;
import com.gestaoViagens.entity.Usuario;
import com.gestaoViagens.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNome("Admin");
            admin.setEmail("admin@tripflow.com");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setAtivo(true);
            usuarioRepository.save(admin);

            Usuario motorista = new Usuario();
            motorista.setNome("Motorista");
            motorista.setEmail("motorista@tripflow.com");
            motorista.setSenha(passwordEncoder.encode("motorista123"));
            motorista.setRole(Role.MOTORISTA);
            motorista.setAtivo(true);
            usuarioRepository.save(motorista);
        }
    }
}

