package com.transito.escala.model;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "escalas_diarias", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"servidor_id", "data_escala"})) 
public class EscalaDiaria implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_escala", nullable = false)
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "servidor_id", nullable = false)
    private Servidor servidor;

    @ManyToOne
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    // Campo de texto antigo removido para não dar conflito com a nova tabela
    // private String determinacao; <-- APAGADO

    @Column(columnDefinition = "TEXT")
    private String observacao;
}