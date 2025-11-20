package com.gestaoViagens.repository;

import com.gestaoViagens.entity.Usuario;
import com.gestaoViagens.entity.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    List<Viagem> findByMotoristaIdOrderByDataCriacaoDesc(Usuario motorista);

    List<Viagem> findAllByOrderByDataCriacaoDesc();
}
