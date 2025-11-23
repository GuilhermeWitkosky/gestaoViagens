package com.gestaoViagens.service;

import com.gestaoViagens.DTO.LocalRequest;
import com.gestaoViagens.DTO.LocalResponse;
import com.gestaoViagens.entity.Local;
import com.gestaoViagens.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;

    public List<LocalResponse> listarAtivos() {
        return localRepository.findByAtivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<LocalResponse> listarTodos() {
        return localRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public LocalResponse criar(LocalRequest request) {
        Local local = Local.builder()
                .nome(request.nome())
                .endereco(request.endereco())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .observacoes(request.observacoes())
                .ativo(true)
                .build();

        Local salvo = localRepository.save(local);
        return toResponse(salvo);
    }

    public LocalResponse atualizar(Long id, LocalRequest request) {
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Local não encontrado"));

        local.setNome(request.nome());
        local.setEndereco(request.endereco());
        local.setLatitude(request.latitude());
        local.setLongitude(request.longitude());
        local.setObservacoes(request.observacoes());

        Local salvo = localRepository.save(local);
        return toResponse(salvo);
    }

    public void desativar(Long id) {
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Local não encontrado"));

        local.setAtivo(false);
        localRepository.save(local);
    }

    public void ativar(Long id) {
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Local não encontrado"));

        local.setAtivo(true);
        localRepository.save(local);
    }

    private LocalResponse toResponse(Local local) {
        return new LocalResponse(
                local.getId(),
                local.getNome(),
                local.getEndereco(),
                local.getLatitude(),
                local.getLongitude(),
                local.getObservacoes(),
                local.isAtivo()
        );
    }

}
