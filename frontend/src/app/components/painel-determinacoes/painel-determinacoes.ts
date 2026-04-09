import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeterminacaoService } from '../../services/determinacao.service';
import { Determinacao } from '../../models/determinacao';

@Component({
  selector: 'app-painel-determinacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-determinacoes.html',
  styleUrl: './painel-determinacoes.scss' // De volta à elegância!
})

export class PainelDeterminacoes implements OnInit {

  determinacoes: Determinacao[] = [];
  mensagem: string = '';
  erro: string = '';

  // Objeto temporário para o formulário da tela
  novaDeterminacao = {
    escalaId: null as number | null,
    areaAtuacao: '',
    setor: '',
    instrucoes: ''
  };

  constructor(
    private determinacaoService: DeterminacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDeterminacoes();
  }

  carregarDeterminacoes(): void {
    this.determinacaoService.listarTodas().subscribe({
      next: (dados) => {
        this.determinacoes = dados;
        this.cdr.detectChanges(); // Acorda o Angular para desenhar a tabela!
      },
      error: (err) => console.error('Erro ao buscar determinações', err)
    });
  }

  salvarDeterminacao(): void {
    if (!this.novaDeterminacao.escalaId || !this.novaDeterminacao.areaAtuacao || !this.novaDeterminacao.instrucoes) {
      this.erro = 'Preencha os campos obrigatórios (ID da Escala, Área e Instruções).';
      return;
    }

    // Monta o pacote exatamente como o Java espera receber
    const pacoteParaSalvar: Determinacao = {
      escala: { id: this.novaDeterminacao.escalaId },
      areaAtuacao: this.novaDeterminacao.areaAtuacao.toUpperCase(), // Força maiúsculo (ex: MT01)
      setor: this.novaDeterminacao.setor || 'NA', // Se deixar vazio, assume 'NA'
      instrucoes: this.novaDeterminacao.instrucoes
    };

    this.determinacaoService.salvar(pacoteParaSalvar).subscribe({
      next: () => {
        this.mensagem = 'Determinação salva com sucesso!';
        this.erro = '';
        this.novaDeterminacao = { escalaId: null, areaAtuacao: '', setor: '', instrucoes: '' }; // Limpa o form
        this.carregarDeterminacoes(); // Recarrega a tabela
        setTimeout(() => this.mensagem = '', 3000);
      },
      error: (err) => {
        this.erro = 'Erro ao salvar. Verifique se o ID da Escala realmente existe.';
        console.error(err);
      }
    });
  }

  excluirDeterminacao(id: number): void {
    if (confirm('Tem certeza que deseja apagar esta determinação?')) {
      this.determinacaoService.deletar(id).subscribe({
        next: () => {
          this.mensagem = 'Determinação excluída!';
          this.carregarDeterminacoes();
          setTimeout(() => this.mensagem = '', 3000);
        },
        error: (err) => console.error('Erro ao excluir', err)
      });
    }
  }
}