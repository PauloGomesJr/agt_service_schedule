import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-painel-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-usuarios.html',
  styleUrl: './painel-usuarios.scss'
})
export class PainelUsuariosComponent implements OnInit {

  usuariosPendentes: any[] = [];
  mensagem: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPendentes();
  }

  carregarPendentes(): void {
    this.usuarioService.listarPendentes().subscribe({
      next: (dados) => {
        console.log('👀 Dados recebidos do Java:', dados); 
        this.usuariosPendentes = dados;
        this.cdr.detectChanges(); // <--- A Mágica acontece aqui
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
          this.carregarPendentes(); 
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