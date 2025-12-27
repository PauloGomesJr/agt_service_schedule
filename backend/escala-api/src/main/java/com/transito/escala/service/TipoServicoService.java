package com.transito.escala.service;

import com.transito.escala.model.TipoServico;
import com.transito.escala.repository.TipoServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TipoServicoService {
    private final TipoServicoRepository repository;

    public TipoServicoService(TipoServicoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public TipoServico salvar(TipoServico tipoServico) {
        // Regra: Normaliza o código para maiúsculo
        tipoServico.setCodigo(tipoServico.getCodigo().toUpperCase());
        
        // Validação básica de duplicidade
        if (tipoServico.getId() == null && repository.findByCodigo(tipoServico.getCodigo()).isPresent()) {
            throw new IllegalArgumentException("Código já existente: " + tipoServico.getCodigo());
        }
        return repository.save(tipoServico);
    }

    public List<TipoServico> listarTodos() {
        return repository.findAll();
    }
}
