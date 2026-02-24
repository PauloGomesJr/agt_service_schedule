package com.transito.escala.dto;

public class PermutaDTO {
    
    private Long escalaOrigemId;
    private Long escalaDestinoId;

    // Getters e Setters
    public Long getEscalaOrigemId() {
        return escalaOrigemId;
    }

    public void setEscalaOrigemId(Long escalaOrigemId) {
        this.escalaOrigemId = escalaOrigemId;
    }

    public Long getEscalaDestinoId() {
        return escalaDestinoId;
    }

    public void setEscalaDestinoId(Long escalaDestinoId) {
        this.escalaDestinoId = escalaDestinoId;
    }
}
