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

  escalasDisponiveis: Escala[] = []; // <-- VARIÁVEL CORRIGIDA AQUI!
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

  carregarDeterminacoes(): void {
    this.determinacaoService.listarTodas().subscribe({
      next: (dados: any) => { // <-- TIPAGEM ANY ADICIONADA
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
        this.carregarDeterminacoes(); 
        setTimeout(() => this.mensagem = '', 3000);
      },
      error: (err: any) => { // <-- TIPAGEM ANY ADICIONADA
        this.erro = 'Erro ao salvar. Verifique se o ID da Escala realmente existe.';
        console.error(err);
      }
    });
  }

  prepararCopia(det: Determinacao): void {
    // 1. Copia os dados, mas força o usuário a escolher uma nova Escala (deixa null)
    this.novaDeterminacao = {
      escalaId: null, 
      areaAtuacao: det.areaAtuacao,
      setor: det.setor,
      instrucoes: det.instrucoes
    };

    // 2. Dá um feedback visual rápido
    this.mensagem = 'Instrução copiada! Selecione a nova escala para o próximo agente e salve.';
    setTimeout(() => this.mensagem = '', 4000);

    // 3. Rola a tela suavemente de volta para o topo (para o formulário)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirDeterminacao(id: number): void {
    if (confirm('Tem certeza que deseja apagar esta determinação?')) {
      this.determinacaoService.deletar(id).subscribe({
        next: () => {
          this.mensagem = 'Determinação excluída!';
          this.carregarDeterminacoes();
          setTimeout(() => this.mensagem = '', 3000);
        },
        error: (err: any) => console.error('Erro ao excluir', err)
      });
    }
  }
  
  carregarEscalas(): void {
    // Mudamos de listarTodas() para listar()!
    this.escalaService.listar().subscribe({ 
      next: (dados: any) => { 
        this.escalasDisponiveis = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao buscar escalas', err) 
    });
  }
}