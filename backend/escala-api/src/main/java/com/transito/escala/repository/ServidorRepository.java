package com.transito.escala.repository;

import com.transito.escala.model.Servidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServidorRepository extends JpaRepository<Servidor, Long> {
    // Método customizado mágico: o Spring cria o SQL sozinho baseando-se no nome do método
    Optional<Servidor> findByMatricula(String matricula);
}