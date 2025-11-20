package com.gestaoViagens.controller;

import com.gestaoViagens.DTO.LocalRequest;
import com.gestaoViagens.DTO.LocalResponse;
import com.gestaoViagens.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/locais")
@RequiredArgsConstructor
public class LocalController {

    private final LocalService localService;

    @GetMapping
    public List<LocalResponse> listar() {
        return localService.listarAtivos();
    }

    @PostMapping
    public ResponseEntity<LocalResponse> criar(@RequestBody LocalRequest request) {
        LocalResponse response = localService.criar(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalResponse> atualizar(
            @PathVariable Long id,
            @RequestBody LocalRequest request
    ) {
        LocalResponse response = localService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        localService.desativar(id);
        return ResponseEntity.noContent().build();
    }



}
