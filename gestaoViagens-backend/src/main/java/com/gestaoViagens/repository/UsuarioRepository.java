package com.gestaoViagens.repository;

import com.gestaoViagens.ENUM.Role;
import com.gestaoViagens.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndAtivoTrue(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByRoleAndAtivoTrue(Role role);
}
