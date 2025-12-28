package com.transito.escala.repository;

import com.transito.escala.model.EscalaDiaria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EscalaDiariaRepository extends JpaRepository<EscalaDiaria, Long> {
    
    // Busca escalas de um período específico (útil para a tela mensal)
    List<EscalaDiaria> findByDataBetween(LocalDate inicio, LocalDate fim);

    // Busca escalas de um servidor específico
    List<EscalaDiaria> findByServidorId(Long servidorId);
    
    // Verifica se já existe escala para aquele servidor naquele dia
    Optional<EscalaDiaria> findByServidorIdAndData(Long servidorId, LocalDate data);
}
