package com.gestaoViagens.repository;

import com.gestaoViagens.entity.Local;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalRepository extends JpaRepository<Local, Long> {

    List<Local> findByAtivoTrue();


    List<Local> findByAtivoTrueOrderByNomeAsc();

}
