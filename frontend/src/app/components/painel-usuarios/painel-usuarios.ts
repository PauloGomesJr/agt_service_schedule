import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario';
// Se você usa Angular 17+ com Standalone, não esqueça de importar o CommonModule (ngIf, ngFor) aqui no topo se precisar!

@Component({
  selector: 'app-painel-usuarios',
  templateUrl: './painel-usuarios.html',
  styleUrls: ['./painel-usuarios.scss']
})
export class PainelUsuariosComponent implements OnInit {

  usuariosPendentes: any[] = [];
  mensagem: string = '';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarPendentes();
  }

  carregarPendentes(): void {
    this.usuarioService.listarPendentes().subscribe({
      next: (dados) => {
        this.usuariosPendentes = dados;
      },
      error: (err) => {
        console.error('Erro ao buscar fila de espera', err);
      }
    });
  }

  aprovarUsuario(id: number, nome: string): void {
    if (confirm(`Tem certeza que deseja aprovar o acesso de ${nome}?`)) {
      this.usuarioService.aprovar(id).subscribe({
        next: () => {
          this.mensagem = `Usuário ${nome} aprovado com sucesso!`;
          // Recarrega a lista para sumir com o usuário recém-aprovado
          this.carregarPendentes(); 
          
          // Apaga a mensagem de sucesso depois de 3 segundos
          setTimeout(() => this.mensagem = '', 3000);
        },
        error: (err) => {
          console.error('Erro ao aprovar', err);
          alert('Erro ao tentar aprovar o usuário.');
        }
      });
    }
  }
}