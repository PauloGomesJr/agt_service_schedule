import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../header/header';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Servidor } from '../../models/servidor.model';
import { ServidorService } from '../../services/servidor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servidores',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './servidores.html'
  // O bloco gigante de 'styles' foi removido porque o Bootstrap agora faz todo o trabalho!
})
export class ServidoresComponent implements OnInit {

  // Lista que vai para a tela
  lista: Servidor[] = [];
  
  // === NOVAS VARIÁVEIS PARA O FILTRO ===
  listaCompleta: Servidor[] = []; // Guarda todo mundo que vem do banco
  mostrarInativos: boolean = false; // Controla a caixinha

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
        // === ORDENAÇÃO PELO NOME OFICIAL ===
        dados.sort((a, b) => {
          const nomeA = (a.nome || '').trim().toUpperCase();
          const nomeB = (b.nome || '').trim().toUpperCase();
          return nomeA.localeCompare(nomeB);
        });
        // ====================================

        // Guarda a lista original intocável
        this.listaCompleta = dados;
        
        // Aplica o filtro para decidir quem vai aparecer na tela
        this.aplicarFiltro();
      },
      error: (erro) => {
        console.error('Erro ao buscar servidores:', erro);
        alert('Erro ao carregar lista de servidores.');
      }
    });
  }

  salvar() {
    if (!this.cadastro.nome || !this.cadastro.matricula) {
      Swal.fire({
        title: 'Atenção!',
        text: 'Preencha Nome e Matrícula antes de salvar.',
        icon: 'warning',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (this.cadastro.id) {
      this.service.atualizar(this.cadastro).subscribe(() => {
        this.finalizarAcao('Servidor atualizado com sucesso!');
      });
    } else {
      this.service.cadastrar(this.cadastro).subscribe(() => {
        this.finalizarAcao('Servidor cadastrado com sucesso!');
      });
    }
  }

  finalizarAcao(mensagem: string) {
    Swal.fire({
      title: 'Sucesso!',
      text: mensagem,
      icon: 'success',
      confirmButtonColor: '#28a745'
    });
    this.carregar();
    this.cancelar();
  }

  excluir(id: number | undefined) {
    if (!id) return;
    
    Swal.fire({
      title: 'Desativar Servidor?',
      text: 'Ele será inativado e não aparecerá mais nas novas escalas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, inativar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.excluir(id).subscribe({
          next: () => {
            Swal.fire('Inativado!', 'O servidor foi removido da lista ativa.', 'success');
            this.carregar(); 
          },
          error: (erro) => {
            console.error('Erro ao excluir:', erro);
            Swal.fire('Erro!', 'Não foi possível inativar o servidor.', 'error');
          }
        });
      }
    });
  }

  editar(item: Servidor) {
    // Copia o objeto para não alterar a tabela em tempo real antes de salvar
    this.cadastro = { ...item };
  }

  aplicarFiltro() {
    if (this.mostrarInativos) {
      this.lista = [...this.listaCompleta]; // Mostra todo mundo
    } else {
      this.lista = this.listaCompleta.filter(s => s.situacao !== 'INATIVO'); // Esconde inativos
    }
    this.cdr.detectChanges(); // Atualiza a tela
  }

  cancelar() {
    this.cadastro = this.criarFormularioVazio();
  }

  // Helper para cor da badge de situação (As classes bg-* são do Bootstrap nativo!)
  getClasseSituacao(situacao: string): string {
    switch(situacao) {
      case 'ATIVO': return 'bg-success'; // Verde
      case 'INATIVO': return 'bg-danger'; // Vermelho
      case 'FERIAS': return 'bg-warning'; // Amarelo
      default: return 'bg-secondary'; // Cinza
    }
  }
}