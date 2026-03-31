package com.transito.escala.controller;

import com.transito.escala.dto.EscalaDiariaDTO;
import com.transito.escala.model.EscalaDiaria;
import com.transito.escala.service.EscalaDiariaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escalas")
public class EscalaDiariaController {

    // NOME CORRIGIDO E PADRONIZADO
    private final EscalaDiariaService escalaDiariaService;

    public EscalaDiariaController(EscalaDiariaService escalaDiariaService) {
        this.escalaDiariaService = escalaDiariaService;
    }

    @PostMapping
    public ResponseEntity<EscalaDiaria> criar(@RequestBody EscalaDiariaDTO dto) {
        // Uso correto da variável
        return ResponseEntity.status(HttpStatus.CREATED).body(escalaDiariaService.salvar(dto));
    }

    @GetMapping
    public ResponseEntity<List<EscalaDiaria>> listar() {
        return ResponseEntity.ok(escalaDiariaService.listarTodas());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        // Uso correto da variável
        escalaDiariaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    // Mapeia para a URL /api/escalas/permutar
    @PostMapping("/permutar")
    public ResponseEntity<Void> permutar(@RequestBody com.transito.escala.dto.PermutaDTO dto) {
        escalaDiariaService.permutar(dto.getEscalaOrigemId(), dto.getEscalaDestinoId());
        return ResponseEntity.ok().build();
    }
}