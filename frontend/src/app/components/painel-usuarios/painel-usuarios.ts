import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- Importação obrigatória
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-painel-usuarios',
  standalone: true, // <--- A MÁGICA ESTÁ AQUI!
  imports: [CommonModule], // <--- E AQUI!
  templateUrl: './painel-usuarios.html',
  styleUrl: './painel-usuarios.scss' // Correção: no Angular 17 é styleUrl no singular
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
        // Nosso espião para confirmar que o Angular pegou o pacote:
        console.log('👀 Dados recebidos do Java:', dados); 
        
        // Atualiza a tela
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