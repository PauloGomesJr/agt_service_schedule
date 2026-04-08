package com.transito.escala.service; // Ajuste o pacote

import com.transito.escala.model.Determinacao;
import com.transito.escala.model.EscalaDiaria;
import com.transito.escala.repository.DeterminacaoRepository;
import com.transito.escala.repository.EscalaDiariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeterminacaoService {

    @Autowired
    private DeterminacaoRepository determinacaoRepository;

    @Autowired
    private EscalaDiariaRepository escalaRepository;

    public List<Determinacao> listarTodas() {
        return determinacaoRepository.findAll();
    }

    public List<Determinacao> buscarPorEscala(Long escalaId) {
        return determinacaoRepository.findByEscalaId(escalaId);
    }

    public Determinacao salvar(Determinacao determinacao) {
        // 1. Validação de segurança para matar o alerta da IDE
        if (determinacao.getEscala() == null || determinacao.getEscala().getId() == null) {
            throw new IllegalArgumentException("A determinação precisa estar vinculada a uma escala informando o ID.");
        }

        // 2. Verifica se a escala vinculada realmente existe no banco
        EscalaDiaria escala = escalaRepository.findById(determinacao.getEscala().getId())
                .orElseThrow(() -> new RuntimeException("Escala não encontrada!"));
        
        determinacao.setEscala(escala);
        return determinacaoRepository.save(determinacao);
    }

    public void deletar(Long id) {
        determinacaoRepository.deleteById(id);
    }
}
