package com.transito.escala.config;

import com.transito.escala.model.TipoServico;
import com.transito.escala.repository.TipoServicoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final TipoServicoRepository tipoServicoRepository;

    public DataSeeder(TipoServicoRepository tipoServicoRepository) {
        this.tipoServicoRepository = tipoServicoRepository;
    }

   @Override
    public void run(String... args) throws Exception {
        if (tipoServicoRepository.count() <= 1) { 
            
            System.out.println("---- INICIANDO CARGA DE DADOS DE TESTE ----");

            // 1. Criar Turno C (Noturno)
            TipoServico turnoC = new TipoServico();
            turnoC.setCodigo("C");
            turnoC.setDescricao("Plantão Noturno");
            turnoC.setHoraInicio(LocalTime.of(19, 0));
            turnoC.setHoraFim(LocalTime.of(7, 0)); 
            turnoC.setHorasTotais(12);      // <--- INTEIRO (Sem ponto)
            turnoC.setHorasNoturnas(8.0);   // <--- DECIMAL (Com ponto)
            turnoC.setGeraAdicionalNoturno(true);

            // 2. Criar Turno M (Manhã: 07:00 às 13:00)
            TipoServico turnoM = new TipoServico();
            turnoM.setCodigo("M");
            turnoM.setDescricao("Manhã");
            turnoM.setHoraInicio(LocalTime.of(7, 0));
            turnoM.setHoraFim(LocalTime.of(13, 0));
            
            // AQUI ESTAVA O ERRO, AGORA ESTÁ CORRIGIDO:
            turnoM.setHorasTotais(6);       // Use 'turnoM', não 'turnoC'
            
            turnoM.setHorasNoturnas(0.0);
            turnoM.setGeraAdicionalNoturno(false);

            // Salva no banco
            tipoServicoRepository.saveAll(List.of(turnoC, turnoM));
            
            System.out.println("---- DADOS DE TESTE (Turnos C e M) CRIADOS COM SUCESSO! ----");
        }
    }
    
}