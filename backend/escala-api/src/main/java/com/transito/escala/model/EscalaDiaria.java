package com.transito.escala.model;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;


@Data
@Entity
@Table(name = "escalas_diarias", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"servidor_id", "data_escala"})) 
       // A constraint acima impede que o mesmo servidor tenha duas escalas no mesmo dia (regra básica)
public class EscalaDiaria implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_escala", nullable = false)
    private LocalDate data;

    // Relacionamento com Servidor (Muitas escalas para Um servidor)
    @ManyToOne
    @JoinColumn(name = "servidor_id", nullable = false)
    private Servidor servidor;

    // Relacionamento com TipoServico (Muitas escalas podem ter esse Tipo de Serviço)
    @ManyToOne
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    // ... outros campos (data, observacao, etc)

    @Column(columnDefinition = "TEXT")
    private String determinacao;

    // Lembre-se de gerar os Getters e Setters para este novo campo no final do arquivo!
    public String getDeterminacao() {
        return determinacao;
    }

    public void setDeterminacao(String determinacao) {
        this.determinacao = determinacao;
    }

    // Campo para observações (ex: "Troca autorizada", "Atraso", etc)
    @Column(columnDefinition = "TEXT")
    private String observacao;
}