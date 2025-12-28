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
@CrossOrigin(origins = "*")
public class EscalaDiariaController {

    private final EscalaDiariaService service;

    public EscalaDiariaController(EscalaDiariaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EscalaDiaria> criar(@RequestBody EscalaDiariaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(dto));
    }

    @GetMapping
    public ResponseEntity<List<EscalaDiaria>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }
}
