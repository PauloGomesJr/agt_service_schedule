package com.transito.escala.service;

import com.transito.escala.model.Servidor;
import com.transito.escala.repository.ServidorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServidorService {

    private final ServidorRepository servidorRepository;

    // Injeção de dependência via construtor (Melhor prática que @Autowired)
    public ServidorService(ServidorRepository servidorRepository) {
        this.servidorRepository = servidorRepository;
    }

    @Transactional // Garante que a operação no banco seja atômica
    public Servidor salvar(Servidor servidor) {
        // Exemplo de regra de negócio: Verificar se já existe matrícula
        if (servidor.getId() == null && servidorRepository.findByMatricula(servidor.getMatricula()).isPresent()) {
            throw new IllegalArgumentException("Já existe um servidor cadastrado com esta matrícula.");
        }
        return servidorRepository.save(servidor);
    }

    public List<Servidor> listarTodos() {
        return servidorRepository.findAll();
    }
    
    public Servidor buscarPorId(Long id) {
        return servidorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servidor não encontrado"));
    }
}