import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  usuario: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Pega o nome do usuário assim que o Header carregar
    this.usuario = this.authService.getUsuarioLogado();
  }

  sair() {
    this.authService.logout(); // Joga a chave fora
    this.router.navigate(['/login']); // Manda pro login
  }
}