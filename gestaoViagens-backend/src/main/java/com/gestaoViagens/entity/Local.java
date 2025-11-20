package com.gestaoViagens.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String endereco;

    private Double latitude;

    private Double longitude;

    @Column(length = 1000)
    private String observacoes;

    @Column(nullable = false)
    private boolean ativo = true;
}
