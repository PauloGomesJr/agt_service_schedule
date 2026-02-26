import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Importando o seu arquivo auth.ts

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  credenciais = {
    login: '',
    senha: ''
  };

  mensagemErro = '';
  carregando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  fazerLogin() {
    this.mensagemErro = '';
    
    if (!this.credenciais.login || !this.credenciais.senha) {
      this.mensagemErro = 'Preencha o usuário e a senha.';
      return;
    }

    this.carregando = true;

    this.authService.login(this.credenciais).subscribe({
      next: () => {
        // Deu certo! O Java aceitou e o auth.ts guardou o token.
        // Vamos mandar o usuário para a tela da escala:
        this.router.navigate(['/escala']);
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 403 || err.status === 401) {
          this.mensagemErro = 'Usuário ou senha incorretos.';
        } else {
          this.mensagemErro = 'Erro ao conectar com o servidor.';
        }
      }
    });
  }
}