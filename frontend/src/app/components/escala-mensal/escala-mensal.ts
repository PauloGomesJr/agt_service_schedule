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
  
  // Mapa visual: { idServidor: { dia: 'A', dia2: 'F' } }
  mapaEscalas: any = {}; 

  dataReferencia = new Date(); 
  anoAtual = this.dataReferencia.getFullYear();
  mesAtual = this.dataReferencia.getMonth();
  diasDoMes: Date[] = [];

  modalAberto = false;
  
  escalaSelecionada: any = {
    id: null, // <--- CAMPO NOVO: Para saber qual excluir
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
    this.atualizarMapaVisualizacao(); // Recalcula o mapa para o novo mês
  }

  getDataVisualizacao(): Date {
    return new Date(this.anoAtual, this.mesAtual, 1);
  }

  carregarDados() {
    this.servidorService.listar().subscribe(dados => {
      this.servidores = dados.filter(s => s.situacao === 'ATIVO');
      this.cdr.detectChanges();
    });

    this.tipoServicoService.listar().subscribe(dados => {
      this.tiposServico = dados;
      this.cdr.detectChanges();
    });

    this.escalaService.listar().subscribe(dados => {
      this.escalas = dados;
      this.atualizarMapaVisualizacao();
      this.cdr.detectChanges();
    });
  }

  atualizarMapaVisualizacao() {
    this.mapaEscalas = {}; 

    this.escalas.forEach(escala => {
        const partes = escala.data.split('-'); 
        
        const anoEscala = parseInt(partes[0]);        
        const mesEscala = parseInt(partes[1]) - 1;    
        const dia = parseInt(partes[2]);              

        if (anoEscala === this.anoAtual && mesEscala === this.mesAtual) {
            
            const idServidor = escala.servidor.id;
            
            if (idServidor) {
                if (!this.mapaEscalas[idServidor]) {
                    this.mapaEscalas[idServidor] = {};
                }
                this.mapaEscalas[idServidor][dia] = escala.tipoServico.codigo;
            }
        }
    });
    console.log(`Mapa reconstruído para o mês ${this.mesAtual + 1}/${this.anoAtual}`);
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
    // Reseta o objeto, inclusive o ID
    this.escalaSelecionada = {
      id: null,
      servidorId: servidor.id,
      nomeServidor: servidor.nome,
      data: data,
      tipoServicoId: null 
    };

    const dataStr = data.toISOString().split('T')[0];
    const escalaExistente = this.escalas.find(e => 
      e.servidor.id === servidor.id && e.data === dataStr
    );
    
    // Se achou escala, preenche o ID para permitir edição/exclusão
    if (escalaExistente) {
      this.escalaSelecionada.id = escalaExistente.id; // <--- PEGA O ID AQUI
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
        // Atualiza a LISTA (Remove antigo se houver e põe o novo)
        this.escalas = this.escalas.filter(e => 
          !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data)
        );
        this.escalas.push(novaEscala);
        
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

  // === NOVO MÉTODO: EXCLUIR ===
  excluirEscala() {
    // Só exclui se tiver ID
    if (!this.escalaSelecionada.id) return;

    if (confirm('Tem certeza que deseja remover esta escala?')) {
      this.escalaService.excluir(this.escalaSelecionada.id).subscribe({
        next: () => {
          // 1. Remove da lista local (memória)
          this.escalas = this.escalas.filter(e => e.id !== this.escalaSelecionada.id);
          
          // === A CORREÇÃO ESTÁ AQUI ===
          // PRIMEIRO: Fecha o modal (Define modalAberto = false)
          this.fecharModal(); 

          // SEGUNDO: Atualiza o visual (tira a cor da célula)
          this.atualizarMapaVisualizacao();

          // TERCEIRO: Manda o Angular aplicar as mudanças na tela
          // Como a variável modalAberto já é false, ele vai remover o modal da tela agora.
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao excluir escala.');
        }
      });
    }
  }

  getTurno(servidor: any, dia: number): string {
    if (!servidor.id) return '';
    if (this.mapaEscalas && this.mapaEscalas[servidor.id]) {
        return this.mapaEscalas[servidor.id][dia] || '';
    }
    return '';
  }

  obterClasseTurno(codigo: string | undefined): string {
    if (!codigo) return ''; 
    switch (codigo.toUpperCase()) {
      case 'C': return 'turno-noite';
      case 'A': return 'turno-manha';
      case 'B': return 'turno-tarde';
      case 'F': return 'turno-folga';
      default:  return 'turno-padrao'; 
    }
  }
}