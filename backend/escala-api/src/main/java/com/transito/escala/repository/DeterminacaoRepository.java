package com.transito.escala.repository;

import com.transito.escala.model.Determinacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeterminacaoRepository extends JpaRepository<Determinacao, Long> {
    
    // Método mágico do Spring para buscar todas as determinações de uma escala específica
    List<Determinacao> findByEscalaId(Long escalaId);
}