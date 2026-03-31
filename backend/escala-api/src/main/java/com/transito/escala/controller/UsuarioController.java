package com.transito.escala.controller;

import com.transito.escala.model.Usuario;
import com.transito.escala.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    // 1. LISTAR PENDENTES (Mostra quem está na fila de espera)
    @GetMapping("/pendentes")
    public ResponseEntity<List<Usuario>> listarPendentes() {
        List<Usuario> pendentes = repository.findAllByAprovadoFalse();
        return ResponseEntity.ok(pendentes);
    }

    // 2. APROVAR USUÁRIO (Muda o status para true)
    @PutMapping("/aprovar/{id}")
    public ResponseEntity<Void> aprovar(@PathVariable Long id) {
        // Busca o usuário pelo ID
        Usuario usuario = repository.findById(id).orElse(null);
        
        if (usuario != null) {
            usuario.setAprovado(true); // Libera o acesso!
            repository.save(usuario);
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }
}