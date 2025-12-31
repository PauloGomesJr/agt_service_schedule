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

    private final EscalaDiariaRepository escalaRepository;
    private final ServidorRepository servidorRepository;
    private final TipoServicoRepository tipoServicoRepository;

    // Injeção de dependência de todos os repositórios necessários
    public EscalaDiariaService(EscalaDiariaRepository escalaRepository, 
                               ServidorRepository servidorRepository, 
                               TipoServicoRepository tipoServicoRepository) {
        this.escalaRepository = escalaRepository;
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
        
        // === LINHA NOVA AQUI ===
        validarConflitoHorarios(servidor, dto.getData(), tipoServico);
        // =======================

        // 3. Lógica de UPSERT (Update or Insert)
        // Tenta achar uma escala existente para esse servidor nessa data
        EscalaDiaria escala = escalaRepository.findByServidorIdAndData(dto.getServidorId(), dto.getData())
                .orElse(new EscalaDiaria()); // Se não achar, cria uma nova em branco

        // Atualiza os dados (seja nova ou antiga)
        escala.setData(dto.getData());
        escala.setServidor(servidor);
        escala.setTipoServico(tipoServico);
        escala.setObservacao(dto.getObservacao());

        // 4. Salvar
        return escalaRepository.save(escala);
    }
    
    public List<EscalaDiaria> listarTodas() {
        return escalaRepository.findAll();
    }

    private void validarConflitoHorarios(Servidor servidor, java.time.LocalDate dataAtual, TipoServico novoServico) {
        // Verifica o dia ANTERIOR
        java.time.LocalDate dataOntem = dataAtual.minusDays(1);
        
        escalaRepository.findByServidorIdAndData(servidor.getId(), dataOntem).ifPresent(escalaOntem -> {
            TipoServico servicoOntem = escalaOntem.getTipoServico();
            
            // Se o serviço de ontem vira a noite
            if (servicoOntem.cruzaMeiaNoite()) {
                // Ele termina HOJE neste horário:
                java.time.LocalTime terminoOntemHoje = servicoOntem.getHoraFim();
                java.time.LocalTime inicioNovo = novoServico.getHoraInicio();

                System.out.println("Validando: Ontem acaba às " + terminoOntemHoje + " | Hoje começa às " + inicioNovo);

                // CORREÇÃO: Usamos !isBefore (Não é antes) 
                // Isso significa: É Depois OU É Igual (>=)
                if (!terminoOntemHoje.isBefore(inicioNovo)) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, 
                        "Conflito! O servidor ainda está no plantão de ontem (" 
                        + servicoOntem.getCodigo() + ") até às " + terminoOntemHoje);
                }
            }
        });
    }
}