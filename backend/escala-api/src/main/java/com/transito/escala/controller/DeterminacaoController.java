package com.transito.escala.controller; // Ajuste o pacote

import com.transito.escala.model.Determinacao;
import com.transito.escala.service.DeterminacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/determinacoes")
@CrossOrigin(origins = {"http://localhost:4200", "https://agt-service-schedule.vercel.app"}, allowCredentials = "true")
public class DeterminacaoController {

    @Autowired
    private DeterminacaoService determinacaoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Determinacao> listarTodas() {
        return determinacaoService.listarTodas();
    }

    @GetMapping("/escala/{escalaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Determinacao> buscarPorEscala(@PathVariable Long escalaId) {
        return determinacaoService.buscarPorEscala(escalaId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Determinacao criar(@RequestBody Determinacao determinacao) {
        return determinacaoService.salvar(determinacao);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        determinacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
