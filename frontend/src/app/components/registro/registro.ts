import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms'; // Necessário para pegar os dados do input

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
  standalone: true,
  imports: [FormsModule, RouterModule] // Importando módulos essenciais do Angular 17+
})
export class RegistroComponent {
  login = '';
  senha = '';
  mensagem = '';
  erro = '';

  constructor(private authService: AuthService, private router: Router) {}

  solicitarCadastro() {
    // Monta o pacote de dados forçando o nível de Servidor Comum
    const novoUsuario = {
      login: this.login,
      senha: this.senha,
      role: 'USER' 
    };

    this.authService.registrar(novoUsuario).subscribe({
      next: () => {
        // Sucesso! Mostra a mensagem e manda pro login depois de 4 segundos
        this.mensagem = 'Cadastro realizado! Aguarde a aprovação do administrador.';
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: (err) => {
        this.erro = 'Erro ao criar conta. Esse login já pode estar em uso.';
        console.error(err);
      }
    });
  }
}