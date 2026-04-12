import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeterminacaoService } from '../../services/determinacao.service';
import { Determinacao } from '../../models/determinacao';
import { EscalaService } from '../../services/escala'; 
import { Escala } from '../../models/escala.model'; 

@Component({
  selector: 'app-painel-determinacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-determinacoes.html',
  styleUrl: './painel-determinacoes.scss' 
})
export class PainelDeterminacoes implements OnInit {

  escalasDisponiveis: Escala[] = [];
  determinacoes: Determinacao[] = [];
  mensagem: string = '';
  erro: string = '';

  novaDeterminacao = {
    escalaId: null as number | null,
    areaAtuacao: '',
    setor: '',
    instrucoes: ''
  };

  constructor(
    private determinacaoService: DeterminacaoService,
    private escalaService: EscalaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDeterminacoes();
    this.carregarEscalas();
  }

  // --- MÁGICA 1: Retorna apenas escalas que AINDA NÃO têm determinação ---
  get escalasNaoAtribuidas(): Escala[] {
    const idsComDeterminacao = this.determinacoes.map(d => d.escala.id);
    return this.escalasDisponiveis.filter(escala => !idsComDeterminacao.includes(escala.id));
  }

  // --- MÁGICA 2: Verifica se já tem equipe no mesmo turno e auto-preenche! ---
  verificarEquipeDoTurno(): void {
    if (!this.novaDeterminacao.escalaId) return;

    // Acha os detalhes da escala que o usuário acabou de selecionar no Dropdown
    const escalaSelecionada = this.escalasDisponiveis.find(e => e.id === this.novaDeterminacao.escalaId);
    if (!escalaSelecionada) return;

    // Procura se já existe determinação salva para o MESMO DIA e MESMO TURNO
    const determExistente = this.determinacoes.find(det => 
      det.escala.data === escalaSelecionada.data && 
      det.escala.tipoServico.id === escalaSelecionada.tipoServico.id
    );

    if (determExistente) {
      this.novaDeterminacao.areaAtuacao = determExistente.areaAtuacao;
      this.novaDeterminacao.setor = determExistente.setor;
      this.novaDeterminacao.instrucoes = determExistente.instrucoes;
      
      this.mensagem = '🤖 Instruções auto-preenchidas com base na equipe deste turno!';
      setTimeout(() => this.mensagem = '', 4000);
    }
  }

  carregarDeterminacoes(): void {
    this.determinacaoService.listarTodas().subscribe({
      next: (dados: any) => {
        this.determinacoes = dados;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.error('Erro ao buscar determinações', err)
    });
  }

  salvarDeterminacao(): void {
    if (!this.novaDeterminacao.escalaId || !this.novaDeterminacao.areaAtuacao || !this.novaDeterminacao.instrucoes) {
      this.erro = 'Preencha os campos obrigatórios (ID da Escala, Área e Instruções).';
      return;
    }

    const pacoteParaSalvar: Determinacao = {
      escala: { id: this.novaDeterminacao.escalaId },
      areaAtuacao: this.novaDeterminacao.areaAtuacao.toUpperCase(), 
      setor: this.novaDeterminacao.setor || 'NA', 
      instrucoes: this.novaDeterminacao.instrucoes
    };

    this.determinacaoService.salvar(pacoteParaSalvar).subscribe({
      next: () => {
        this.mensagem = 'Determinação salva com sucesso!';
        this.erro = '';
        this.novaDeterminacao = { escalaId: null, areaAtuacao: '', setor: '', instrucoes: '' }; 
        this.carregarDeterminacoes(); // Ao recarregar, a escala salva some da lista suspensa automaticamente!
        setTimeout(() => this.mensagem = '', 3000);
      },
      error: (err: any) => { 
        this.erro = 'Erro ao salvar. Verifique se o ID da Escala realmente existe.';
        console.error(err);
      }
    });
  }

  prepararCopia(det: Determinacao): void {
    this.novaDeterminacao = {
      escalaId: null, 
      areaAtuacao: det.areaAtuacao,
      setor: det.setor,
      instrucoes: det.instrucoes
    };
    this.mensagem = 'Instrução copiada! Selecione a nova escala para o próximo agente e salve.';
    setTimeout(() => this.mensagem = '', 4000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirDeterminacao(id: number): void {
    if (confirm('Tem certeza que deseja apagar esta determinação?')) {
      this.determinacaoService.deletar(id).subscribe({
        next: () => {
          this.mensagem = 'Determinação excluída! A escala retornou para a lista.';
          this.carregarDeterminacoes(); // Ao excluir, a escala volta a aparecer no Dropdown!
          setTimeout(() => this.mensagem = '', 3000);
        },
        error: (err: any) => console.error('Erro ao excluir', err)
      });
    }
  }
  
  carregarEscalas(): void {
    this.escalaService.listar().subscribe({ 
      next: (dados: any) => { 
        this.escalasDisponiveis = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao buscar escalas', err) 
    });
  }
}