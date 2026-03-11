package com.transito.escala.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EscalaDiariaDTO {
    private Long id;
    private Long servidorId;
    private Long tipoServicoId;
    private LocalDate data;
    private String determinacao;
    private String observacao;

    // Gere o Getter e o Setter dele também!
    public String getDeterminacao() {
        return determinacao;
    }

    public void setDeterminacao(String determinacao) {
        this.determinacao = determinacao;
    }
}

