package com.transito.escala.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;
import java.io.Serializable;

@Data
@Entity
@Table(name = "tipos_servico")
public class TipoServico implements Serializable{
@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ex: "A", "B" (Deve ser único)
    @Column(nullable = false, unique = true, length = 5)
    private String codigo; 

    @Column(nullable = false, length = 100)
    private String descricao;

    @Column(nullable = false, name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(nullable = false, name = "hora_fim")
    private LocalTime horaFim;

    @Column(nullable = false, name = "horas_totais")
    private Integer horasTotais; 

    @Column(nullable = false, name = "horas_noturnas")
    private Double horasNoturnas = 0.0;

    @Column(nullable = false, name = "gera_adicional_noturno")
    private Boolean geraAdicionalNoturno = false;

// Verifica se o turno vira a noite (Ex: Começa 19h, Termina 07h)
    public boolean cruzaMeiaNoite() {
        if (horaInicio == null || horaFim == null) return false;
        return horaFim.isBefore(horaInicio);
    }
}
