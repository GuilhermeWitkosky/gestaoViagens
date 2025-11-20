package com.gestaoViagens.controller;

import com.gestaoViagens.DTO.ViagemCreateRequest;
import com.gestaoViagens.DTO.ViagemResponse;
import com.gestaoViagens.service.ViagemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/viagens")
public class ViagemAdminController {

    private final ViagemService viagemService;

    public ViagemAdminController(ViagemService viagemService) {
        this.viagemService = viagemService;
    }

    @GetMapping
    public ResponseEntity<List<ViagemResponse>> listar() {
        return ResponseEntity.ok(viagemService.listarTodasParaAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(viagemService.buscarPorIdParaAdmin(id));
    }

    @PostMapping
    public ResponseEntity<ViagemResponse> criar(@RequestBody ViagemCreateRequest request) {
        ViagemResponse response = viagemService.criarViagemComoAdmin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<ViagemResponse> iniciarViagem(@PathVariable Long id) {
        ViagemResponse viagemResponse = viagemService.iniciarViagem(id);
        return ResponseEntity.ok(viagemResponse);
    }

}
