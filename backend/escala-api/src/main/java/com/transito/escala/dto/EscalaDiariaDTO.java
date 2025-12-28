package com.transito.escala.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EscalaDiariaDTO {
    private Long id;
    private Long servidorId;
    private Long tipoServicoId;
    private LocalDate data;
    private String observacao;
}