import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <-- NOVO: Importamos o RouterModule
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- NOVO: Adicionamos o RouterModule aqui
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  usuario: string = '';
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isAdmin();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}