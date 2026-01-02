import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// IMPORTAR O SERVICE
import { TipoServicoService } from '../../services/tipo-servico'; // (ou .service se renomeou)

// IMPORTAR O MODELO DA PASTA MODELS
import { TipoServico } from '../../models/tipo-servico.model'; 

@Component({
selector: 'app-tipos-servico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos-servico.html',
  styles: [`
    .container { padding: 20px; max-width: 900px; margin: 0 auto; font-family: sans-serif; }
    
    /* Tabela */
    table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    th { background-color: #2c3e50; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    tr:hover { background-color: #f5f5f5; }

    /* Botões */
    .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 5px;}
    .btn-success { background-color: #27ae60; color: white; }
    .btn-primary { background-color: #3498db; color: white; }
    .btn-danger { background-color: #e74c3c; color: white; }
    .btn-secondary { background-color: #95a5a6; color: white; }

    /* Formulário */
    .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-top: 20px;}
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
    input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    
    h2, h3 { color: #2c3e50; }
  `]
})
export class TiposServicoComponent implements OnInit {
  lista: TipoServico[] = [];
  emEdicao: TipoServico | null = null; 

  constructor(
    private service: TipoServicoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe({
      next: (dados) => {
        // Esta é a linha mágica que atualiza a tela
        this.lista = dados; 
        console.log('Lista atualizada:', this.lista); // Log de confirmação

        // 3. A linha mágica: Força a atualização da tela
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao buscar turnos:', erro);
        alert('Erro de conexão com o servidor.');
      }
    });
  }

  novo() {
    this.emEdicao = {
      codigo: '', descricao: '', horaInicio: '07:00', horaFim: '13:00',
      horasTotais: 6, horasNoturnas: 0, geraAdicionalNoturno: false
    };
  }

  editar(item: TipoServico) {
    this.emEdicao = { ...item };
  }

  salvar() {
    if (!this.emEdicao) return;
    
    // Pequena conversão para garantir tipos numéricos
    this.emEdicao.horasTotais = Number(this.emEdicao.horasTotais);
    this.emEdicao.horasNoturnas = Number(this.emEdicao.horasNoturnas);

    this.service.salvar(this.emEdicao).subscribe({
      next: () => {
        alert('Salvo com sucesso!');
        this.emEdicao = null;
        this.carregar();
      },
      error: (err) => alert('Erro ao salvar. Verifique se o código já existe.')
    });
  }

  excluir(id?: number) {
    if (!id) return;
    if (confirm('Tem certeza? Isso pode afetar escalas antigas.')) {
      this.service.excluir(id).subscribe(() => this.carregar());
    }
  }

  cancelar() {
    this.emEdicao = null;
  }
}