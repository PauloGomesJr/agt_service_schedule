package com.transito.escala.model; // Ajuste para o seu pacote correto

import jakarta.persistence.*;
import lombok.Data;

@Data // Usando o Lombok que você já tem no projeto para poupar getters e setters
@Entity
@Table(name = "determinacoes")
public class Determinacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Conexão com a Escala (que já tem a Data e o TipoServico/Turno)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "escala_id", nullable = false)
    private EscalaDiaria escala;

    @Column(name = "area_atuacao", nullable = false, length = 10)
    private String areaAtuacao; 

    @Column(nullable = false, length = 10)
    private String setor; 

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instrucoes; 
}