package com.transito.escala.service;

import com.transito.escala.dto.EscalaDiariaDTO;
import com.transito.escala.model.EscalaDiaria;
import com.transito.escala.model.Servidor;
import com.transito.escala.model.TipoServico;
import com.transito.escala.repository.EscalaDiariaRepository;
import com.transito.escala.repository.ServidorRepository;
import com.transito.escala.repository.TipoServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EscalaDiariaService {

    // NOME CORRIGIDO E PADRONIZADO
    private final EscalaDiariaRepository escalaDiariaRepository;
    private final ServidorRepository servidorRepository;
    private final TipoServicoRepository tipoServicoRepository;

    public EscalaDiariaService(EscalaDiariaRepository escalaDiariaRepository, 
                               ServidorRepository servidorRepository, 
                               TipoServicoRepository tipoServicoRepository) {
        this.escalaDiariaRepository = escalaDiariaRepository;
        this.servidorRepository = servidorRepository;
        this.tipoServicoRepository = tipoServicoRepository;
    }

    @Transactional
    public EscalaDiaria salvar(EscalaDiariaDTO dto) {
        // 1. Validar se o servidor existe
        Servidor servidor = servidorRepository.findById(dto.getServidorId())
                .orElseThrow(() -> new IllegalArgumentException("Servidor não encontrado ID: " + dto.getServidorId()));

        // 2. Validar se o tipo de serviço existe
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de Serviço não encontrado ID: " + dto.getTipoServicoId()));
        
        // Validação de Conflito
        validarConflitoHorarios(servidor, dto.getData(), tipoServico);

        // 3. Lógica de UPSERT (Update or Insert)
        EscalaDiaria escala = escalaDiariaRepository.findByServidorIdAndData(dto.getServidorId(), dto.getData())
                .orElse(new EscalaDiaria()); 

        // Atualiza os dados
        escala.setData(dto.getData());
        escala.setServidor(servidor);
        escala.setTipoServico(tipoServico);
        escala.setObservacao(dto.getObservacao());

        // 4. Salvar
        return escalaDiariaRepository.save(escala);
    }
    
    public List<EscalaDiaria> listarTodas() {
        return escalaDiariaRepository.findAll();
    }

    private void validarConflitoHorarios(Servidor servidor, java.time.LocalDate dataAtual, TipoServico novoServico) {
        java.time.LocalDate dataOntem = dataAtual.minusDays(1);
        
        // Uso correto da variável escalaDiariaRepository
        escalaDiariaRepository.findByServidorIdAndData(servidor.getId(), dataOntem).ifPresent(escalaOntem -> {
            TipoServico servicoOntem = escalaOntem.getTipoServico();
            
            if (servicoOntem.cruzaMeiaNoite()) {
                java.time.LocalTime terminoOntemHoje = servicoOntem.getHoraFim();
                java.time.LocalTime inicioNovo = novoServico.getHoraInicio();

                if (!terminoOntemHoje.isBefore(inicioNovo)) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, 
                        "Conflito! O servidor ainda está no plantão de ontem (" 
                        + servicoOntem.getCodigo() + ") até às " + terminoOntemHoje);
                }
            }
        });
    }

    // === AGORA FUNCIONA PORQUE O NOME BATE ===
    public void excluir(Long id) {
        escalaDiariaRepository.deleteById(id);
    }
}