package com.gestaoViagens.controller;

import com.gestaoViagens.DTO.LocalResponse;
import com.gestaoViagens.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
public class LocalPublicController {

    private final LocalService localService;

    @GetMapping
    public List<LocalResponse> listarAtivos() {
        return localService.listarAtivos();
    }
}
