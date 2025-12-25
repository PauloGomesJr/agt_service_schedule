package com.transito.escala.controller;

import com.transito.escala.model.Servidor;
import com.transito.escala.service.ServidorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servidores") // URL base
@CrossOrigin(origins = "*") // Permite que o Angular (em outra porta) acesse a API
public class ServidorController {

    private final ServidorService servidorService;

    public ServidorController(ServidorService servidorService) {
        this.servidorService = servidorService;
    }

    @PostMapping
    public ResponseEntity<Servidor> criar(@RequestBody Servidor servidor) {
        Servidor novoServidor = servidorService.salvar(servidor);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoServidor);
    }

    @GetMapping
    public ResponseEntity<List<Servidor>> listar() {
        return ResponseEntity.ok(servidorService.listarTodos());
    }
}