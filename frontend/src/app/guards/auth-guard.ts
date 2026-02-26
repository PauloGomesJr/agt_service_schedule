import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Ajuste o caminho se necessário

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se tem o token, pode entrar
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Se não tem, manda de volta pra tela de login
    router.navigate(['/login']);
    return false;
  }
};