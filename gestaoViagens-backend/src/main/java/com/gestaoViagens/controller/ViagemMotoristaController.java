package com.gestaoViagens.controller;

import com.gestaoViagens.DTO.ViagemCreateRequest;
import com.gestaoViagens.DTO.ViagemResponse;
import com.gestaoViagens.service.ViagemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motorista/viagens")
@RequiredArgsConstructor
public class ViagemMotoristaController {

    private final ViagemService viagemService;

    @PostMapping
    public ResponseEntity<ViagemResponse> criar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ViagemCreateRequest request
    ) {
        String email = userDetails.getUsername();
        ViagemResponse response = viagemService.criarViagemParaMotorista(request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ViagemResponse>> listar(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        List<ViagemResponse> viagens = viagemService.listarParaMotorista(email);
        return ResponseEntity.ok(viagens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponse> buscar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        String email = userDetails.getUsername();
        ViagemResponse response = viagemService.buscarPorIdParaMotorista(id, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pontos/{pontoId}/visitar")
    public ResponseEntity<ViagemResponse> visitarPonto(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @PathVariable Long pontoId
    ) {
        String email = userDetails.getUsername();
        ViagemResponse response = viagemService.marcarPontoComoVisitado(id, pontoId, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<ViagemResponse> iniciarViagem(@PathVariable Long id) {
        ViagemResponse viagemResponse = viagemService.iniciarViagem(id);
        return ResponseEntity.ok(viagemResponse);
    }
}
