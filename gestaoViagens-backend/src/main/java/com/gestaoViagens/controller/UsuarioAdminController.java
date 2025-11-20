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

    @GetMapping("/motoristas")
    public List<UsuarioMotoristaResumoResponse> listarMotoristas() {
        return usuarioAdminService.listarMotoristasAtivos();
    }

}
