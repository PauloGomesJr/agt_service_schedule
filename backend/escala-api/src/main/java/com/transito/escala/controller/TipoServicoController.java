package com.transito.escala.controller;

import com.transito.escala.model.TipoServico;
import com.transito.escala.service.TipoServicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-servico")
@CrossOrigin(origins = "*") // Importante para o Angular
public class TipoServicoController {
    private final TipoServicoService service;

    public TipoServicoController(TipoServicoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TipoServico> criar(@RequestBody TipoServico tipoServico) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(tipoServico));
    }

    @GetMapping
    public ResponseEntity<List<TipoServico>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }
}
