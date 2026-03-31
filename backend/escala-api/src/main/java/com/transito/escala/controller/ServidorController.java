package com.transito.escala.controller;

import com.transito.escala.model.Servidor;
import com.transito.escala.service.ServidorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/servidores")
public class ServidorController {

    private final ServidorService servidorService;

    public ServidorController(ServidorService servidorService) {
        this.servidorService = servidorService;
    }

    // 1. CRIAR
    @PostMapping
    public ResponseEntity<Servidor> criar(@RequestBody Servidor servidor) {
        Servidor novoServidor = servidorService.salvar(servidor);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoServidor);
    }

    // 2. LISTAR
    @GetMapping
    public ResponseEntity<List<Servidor>> listar() {
        return ResponseEntity.ok(servidorService.listarTodos());
    }

    // 3. EDITAR (AQUI ESTAVA FALTANDO!)
    @PutMapping("/{id}")
    public ResponseEntity<Servidor> atualizar(@PathVariable Long id, @RequestBody Servidor servidorAtualizado) {
        // Busca o servidor antigo no banco
        Servidor servidorExistente = servidorService.buscarPorId(id);
        
        // Atualiza os dados (IMPORTANTE: Copiar o Nome de Guerra)
        servidorExistente.setNome(servidorAtualizado.getNome());
        servidorExistente.setNomeGuerra(servidorAtualizado.getNomeGuerra()); // <--- O PULO DO GATO 🐱
        servidorExistente.setMatricula(servidorAtualizado.getMatricula());
        servidorExistente.setEmail(servidorAtualizado.getEmail());
        servidorExistente.setSituacao(servidorAtualizado.getSituacao());

        // Salva as alterações
        Servidor servidorSalvo = servidorService.salvar(servidorExistente);
        
        return ResponseEntity.ok(servidorSalvo);
    }

    // 4. EXCLUIR (TAMBÉM FALTAVA)
   // @DeleteMapping("/{id}")
    //public ResponseEntity<Void> excluir(@PathVariable Long id) {
      //  servidorService.excluir(id);
       // return ResponseEntity.noContent().build();
   // }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        // 1. Busca o servidor usando o seu Service já existente
        Servidor servidor = servidorService.buscarPorId(id);
        
        if (servidor == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. Muda a situação do agente (Exclusão Lógica)
        servidor.inativar();
        
        // 3. Manda o Service salvar essa alteração no banco
        servidorService.salvar(servidor);
        
        return ResponseEntity.noContent().build();
    }
}