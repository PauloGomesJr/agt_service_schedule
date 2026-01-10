import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../models/servidor.model';
import { ServidorService } from '../../services/servidor.service';

@Component({
  selector: 'app-servidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servidores.html',
  //styleUrl: './servidores.scss'

  // ADICIONE ESTE BLOCO STYLES:
  styles: [`
    /* Ajuste geral do container */
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    
    /* Cartão do Formulário */
    .card {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    /* Inputs e Labels */
    .row { display: flex; gap: 15px; flex-wrap: wrap; }
    .col-md-4 { flex: 2; min-width: 250px; }
    .col-md-3 { flex: 1; min-width: 150px; }
    .col-md-2 { flex: 1; min-width: 100px; }
    
    label { display: block; font-weight: bold; margin-bottom: 5px; color: #555; }
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    /* Botões */
    .btn {
      padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; color: white;
    }
    .btn-success { background-color: #28a745; }
    .btn-secondary { background-color: #6c757d; }
    .btn-primary { background-color: #007bff; }
    .btn-danger { background-color: #dc3545; }
    .text-end { text-align: right; margin-top: 15px; }

    /* Tabela */
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
    .table th { background-color: #343a40; color: white; }
    .table-striped tr:nth-child(even) { background-color: #f9f9f9; }

    /* Badges (Etiquetas de Situação) */
    .badge {
      padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; color: white;
    }
    .bg-success { background-color: #28a745; }
    .bg-danger { background-color: #dc3545; }
    .bg-warning { background-color: #ffc107; color: #333; } /* Texto escuro no amarelo */
    .bg-secondary { background-color: #6c757d; }
  `]
})
export class ServidoresComponent implements OnInit {

  // Lista da tabela
  lista: Servidor[] = [];

  // Objeto do formulário
  cadastro: Servidor = this.criarFormularioVazio();

  // Opções para o Select (Dropdown)
  situacoes = ['ATIVO', 'INATIVO', 'FERIAS', 'LICENCA_MEDICA', 'AFASTADO'];

  constructor(
    private service: ServidorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  criarFormularioVazio(): Servidor {
    return {
      nome: '',
      matricula: '',
      email: '',
      situacao: 'ATIVO' // Valor padrão
    };
  }

  carregar() {
    this.service.listar().subscribe({
      next: (dados) => {
        this.lista = dados;
        this.cdr.detectChanges(); // Força atualização da tela
      },
      error: (erro) => {
        console.error('Erro ao buscar servidores:', erro);
        alert('Erro ao carregar lista de servidores.');
      }
    });
  }

  salvar() {
    if (!this.cadastro.nome || !this.cadastro.matricula) {
      alert('Preencha Nome e Matrícula!');
      return;
    }

    if (this.cadastro.id) {
      // MODO EDIÇÃO
      this.service.atualizar(this.cadastro).subscribe(() => {
        this.finalizarAcao('Servidor atualizado com sucesso!');
      });
    } else {
      // MODO CRIAÇÃO
      this.service.cadastrar(this.cadastro).subscribe(() => {
        this.finalizarAcao('Servidor cadastrado com sucesso!');
      });
    }
  }

  editar(item: Servidor) {
    // Copia o objeto para não alterar a tabela em tempo real antes de salvar
    this.cadastro = { ...item };
  }

  excluir(id: number | undefined) {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja excluir este servidor?')) {
      this.service.excluir(id).subscribe(() => {
        this.carregar(); // Recarrega a lista
      });
    }
  }

  cancelar() {
    this.cadastro = this.criarFormularioVazio();
  }

  finalizarAcao(mensagem: string) {
    alert(mensagem);
    this.carregar();
    this.cancelar();
  }

  // Helper para cor da badge de situação
  getClasseSituacao(situacao: string): string {
    switch(situacao) {
      case 'ATIVO': return 'bg-success'; // Verde
      case 'INATIVO': return 'bg-danger'; // Vermelho
      case 'FERIAS': return 'bg-warning'; // Amarelo
      default: return 'bg-secondary'; // Cinza
    }
  }
}