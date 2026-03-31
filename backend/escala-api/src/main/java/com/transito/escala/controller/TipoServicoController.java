package com.transito.escala.controller;

import com.transito.escala.model.TipoServico;
import com.transito.escala.service.TipoServicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-servico")
public class TipoServicoController {

    private final TipoServicoService service;

    public TipoServicoController(TipoServicoService service) {
        this.service = service;
    }

    // 1. LISTAR (Já existia)
    @GetMapping
    public ResponseEntity<List<TipoServico>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // 2. CRIAR (Já existia)
    @PostMapping
    public ResponseEntity<TipoServico> criar(@RequestBody TipoServico tipoServico) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(tipoServico));
    }

    // 3. ATUALIZAR (NOVO - Adicione esta parte)
    @PutMapping("/{id}")
    public ResponseEntity<TipoServico> atualizar(@PathVariable Long id, @RequestBody TipoServico tipoServico) {
        try {
            // Chama o método 'atualizar' que criamos no Service
            TipoServico atualizado = service.atualizar(id, tipoServico);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            // Se o ID não existir, retorna erro 404 (Not Found)
            return ResponseEntity.notFound().build();
        }
    }

    // 4. EXCLUIR (NOVO - Adicione esta parte)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        // Retorna 204 No Content (sucesso sem conteúdo de retorno)
        return ResponseEntity.noContent().build();
    }
}