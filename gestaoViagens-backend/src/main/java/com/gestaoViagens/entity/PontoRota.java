package com.gestaoViagens.entity;

import com.gestaoViagens.ENUM.StatusPontoRota;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pontos_rota")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PontoRota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "viagem_id")
    private Viagem viagem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "local_id")
    private Local local;

    @Column(nullable = false)
    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPontoRota status;
}
