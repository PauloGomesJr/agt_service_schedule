import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth'; 

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Se for chefe, a porta se abre!
    if (this.authService.isAdmin()) {
      return true;
    }
    
    // Se for servidor comum (ou invasor), manda de volta para a tela inicial
    alert('Acesso negado: Apenas administradores podem acessar esta área.');
    this.router.navigate(['/escalas']); // ou para a rota principal que você usa
    return false;
  }
}