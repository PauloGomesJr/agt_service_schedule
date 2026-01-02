import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// Services
import { ServidorService } from '../../services/servidor.service'; 
import { TipoServicoService } from '../../services/tipo-servico';
import { EscalaService } from '../../services/escala';

// Models
import { Servidor } from '../../models/servidor.model';
import { TipoServico } from '../../models/tipo-servico.model';
import { Escala, EscalaDTO } from '../../models/escala.model';

@Component({
  selector: 'app-escala-mensal',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './escala-mensal.html',
  styleUrl: './escala-mensal.scss'
})
export class EscalaMensalComponent implements OnInit {

  // Dados do Banco
  servidores: Servidor[] = [];
  tiposServico: TipoServico[] = [];
  
  // Lista original (para cálculos e lógica)
  escalas: Escala[] = []; 
  
  // === MUDANÇA 1: Novo Objeto para Visualização Rápida ===
  // Vai guardar: { 10: { 1: 'A', 2: 'F' }, 11: { ... } }
  mapaEscalas: any = {}; 

  dataReferencia = new Date(); 
  anoAtual = this.dataReferencia.getFullYear();
  mesAtual = this.dataReferencia.getMonth();
  diasDoMes: Date[] = [];

  modalAberto = false;
  
  escalaSelecionada: any = {
    servidorId: null,
    nomeServidor: '',
    data: null, 
    tipoServicoId: null
  };

  constructor(
    private servidorService: ServidorService,
    private tipoServicoService: TipoServicoService,
    private escalaService: EscalaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gerarDiasDoMes();
    this.carregarDados();
  }

  gerarDiasDoMes() {
    this.diasDoMes = [];
    const data = new Date(this.anoAtual, this.mesAtual, 1);
    while (data.getMonth() === this.mesAtual) {
      this.diasDoMes.push(new Date(data));
      data.setDate(data.getDate() + 1);
    }
  }

  alterarMes(delta: number) {
    this.mesAtual += delta;

    if (this.mesAtual > 11) {
      this.mesAtual = 0; 
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11; 
      this.anoAtual--;
    }

    this.gerarDiasDoMes();
    // Importante: Recarregar os dados se o backend filtrar por mês
    // this.carregarDados(); 
  }

  getDataVisualizacao(): Date {
    return new Date(this.anoAtual, this.mesAtual, 1);
  }

  carregarDados() {
    this.servidorService.listar().subscribe(dados => {
      this.servidores = dados;
      this.cdr.detectChanges();
    });

    this.tipoServicoService.listar().subscribe(dados => {
      this.tiposServico = dados;
      this.cdr.detectChanges();
    });

    this.escalaService.listar().subscribe(dados => {
      this.escalas = dados; // Guarda a lista original
      
      // === MUDANÇA 2: Processar a lista para o formato de Mapa ===
      this.atualizarMapaVisualizacao();

      this.cdr.detectChanges();
    });
  }

  // === MUDANÇA 3: Função Mágica que transforma Lista em Mapa ===
  atualizarMapaVisualizacao() {
    this.mapaEscalas = {}; // Zera o mapa

    this.escalas.forEach(escala => {
        // A data vem como string "YYYY-MM-DD"
        const partes = escala.data.split('-'); 
        const dia = parseInt(partes[2]); // Pega o dia (ex: 5)

        const idServidor = escala.servidor.id;
        
        // CORREÇÃO: Só prossegue se o ID existir
        if (idServidor) {
            // Se ainda não tem uma "gaveta" pra esse servidor, cria uma
            if (!this.mapaEscalas[idServidor]) {
                this.mapaEscalas[idServidor] = {};
            }

            // Guarda o código no dia correspondente
            this.mapaEscalas[idServidor][dia] = escala.tipoServico.codigo;
        }
    });
    
    console.log('Mapa gerado para visualização:', this.mapaEscalas);
  }

  calcularTotalHoras(servidorId: number | undefined): number {
    if (!servidorId) return 0;
    const escalasDoMes = this.escalas.filter(e => {
      if (e.servidor.id !== servidorId) return false;
      const partesData = e.data.split('-'); 
      const anoEscala = parseInt(partesData[0]);
      const mesEscala = parseInt(partesData[1]) - 1; 
      return anoEscala === this.anoAtual && mesEscala === this.mesAtual;
    });
    return escalasDoMes.reduce((total, escala) => total + escala.tipoServico.horasTotais, 0);
  }

  abrirModal(servidor: Servidor, data: Date) {
    this.escalaSelecionada = {
      servidorId: servidor.id,
      nomeServidor: servidor.nome,
      data: data,
      tipoServicoId: null 
    };

    const dataStr = data.toISOString().split('T')[0];
    const escalaExistente = this.escalas.find(e => 
      e.servidor.id === servidor.id && e.data === dataStr
    );
    
    if (escalaExistente) {
      this.escalaSelecionada.tipoServicoId = escalaExistente.tipoServico.id;
    }
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEscala() {
    if (!this.escalaSelecionada.tipoServicoId) {
      alert('Selecione um turno!');
      return;
    }

    const dataFormatada = this.escalaSelecionada.data.toLocaleDateString('en-CA'); 

    const dto: EscalaDTO = {
      servidorId: this.escalaSelecionada.servidorId,
      tipoServicoId: this.escalaSelecionada.tipoServicoId,
      data: dataFormatada,
      observacao: 'Inserido via Web'
    };

    this.escalaService.salvar(dto).subscribe({
      next: (novaEscala) => {
        // Atualiza a LISTA
        this.escalas = this.escalas.filter(e => 
          !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data)
        );
        this.escalas.push(novaEscala);
        
        // === MUDANÇA 4: Atualiza o MAPA visual ===
        this.atualizarMapaVisualizacao();

        this.cdr.detectChanges(); 
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro detalhado:', err);
        let mensagem = 'Erro ao salvar escala.';
        if (err.error && err.error.message) {
             mensagem = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
             mensagem = err.error;
        }
        alert('⚠️ Não foi possível salvar:\n' + mensagem);
      }
    });
  }

  // === MUDANÇA 5: O getTurno agora lê do MAPA, não da lista ===
  getTurno(servidor: any, dia: number): string {
    // CORREÇÃO: Se o servidor não tiver ID (por algum erro de carga), retorna vazio
    if (!servidor.id) return '';

    // Agora é seguro acessar
    if (this.mapaEscalas && this.mapaEscalas[servidor.id]) {
        return this.mapaEscalas[servidor.id][dia] || '';
    }
    return '';
  }

  obterClasseTurno(codigo: string | undefined): string {
    if (!codigo) return ''; 

    switch (codigo.toUpperCase()) {
      case 'C':
        return 'turno-noite';
      case 'A': 
        return 'turno-manha';
      case 'M': 
        return 'turno-manha';
      case 'F':
        return 'turno-folga';
      default:
        return 'turno-padrao'; 
    }
  }

}