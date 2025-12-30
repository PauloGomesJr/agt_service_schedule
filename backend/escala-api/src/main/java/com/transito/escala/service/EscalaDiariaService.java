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
}