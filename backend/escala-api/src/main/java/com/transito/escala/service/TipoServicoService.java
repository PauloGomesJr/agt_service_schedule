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

    @Transactional
    public TipoServico atualizar(Long id, TipoServico atualizado) {
        return repository.findById(id)
                .map(existente -> {
                    existente.setCodigo(atualizado.getCodigo().toUpperCase());
                    existente.setDescricao(atualizado.getDescricao());
                    existente.setHoraInicio(atualizado.getHoraInicio());
                    existente.setHoraFim(atualizado.getHoraFim());
                    existente.setHorasTotais(atualizado.getHorasTotais());
                    existente.setHorasNoturnas(atualizado.getHorasNoturnas());
                    existente.setGeraAdicionalNoturno(atualizado.getGeraAdicionalNoturno()); 
                    return repository.save(existente);
                })
                .orElseThrow(() -> new IllegalArgumentException("Tipo de serviço não encontrado"));
    }

    @Transactional
    public void excluir(Long id) {
        // Nota: Futuramente validaremos se existem escalas usando este tipo antes de excluir
        repository.deleteById(id);
    }

    public List<TipoServico> listarTodos() {
        return repository.findAll();
    }
}
