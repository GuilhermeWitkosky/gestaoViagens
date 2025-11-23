package com.gestaoViagens.controller;

import com.gestaoViagens.DTO.UsuarioAdminRequest;
import com.gestaoViagens.DTO.UsuarioAdminResponse;
import com.gestaoViagens.DTO.UsuarioMotoristaResumoResponse;
import com.gestaoViagens.service.UsuarioAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioAdminResponse>> listar() {
        return ResponseEntity.ok(usuarioAdminService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<UsuarioAdminResponse> criar(@RequestBody UsuarioAdminRequest request) {
        UsuarioAdminResponse created = usuarioAdminService.criar(request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioAdminResponse> atualizar(
            @PathVariable Long id,
            @RequestBody UsuarioAdminRequest request
    ) {
        UsuarioAdminResponse atualizado = usuarioAdminService.atualizar(id, request);
        return ResponseEntity.ok(atualizado);
    }

    @PostMapping("/{id}/ativar")
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        usuarioAdminService.ativar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        usuarioAdminService.desativar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/motoristas")
    public List<UsuarioMotoristaResumoResponse> listarMotoristas() {
        return usuarioAdminService.listarMotoristasAtivos();
    }

}
