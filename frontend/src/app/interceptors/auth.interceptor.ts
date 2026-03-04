import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Ajuste o caminho se precisar
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta os serviços que vamos precisar
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Pega o token do cofre
  const token = authService.getToken();

  // 2. Clona a requisição e anexa o crachá
  let requisicaoClonada = req;
  if (token) {
    requisicaoClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Manda para o Java, mas fica "escutando" a resposta!
  return next(requisicaoClonada).pipe(
    catchError((erro: HttpErrorResponse) => {
      
      // Se o Java bater a porta na nossa cara (401 Não Autorizado ou 403 Proibido)
      if (erro.status === 401 || erro.status === 403) {
        
        // Evita loop infinito se já estiver na tela de login tentando logar errado
        if (router.url !== '/login') {
          console.warn('Sessão expirada. Deslogando automaticamente...');
          
          authService.logout(); // Limpa o token vencido
          router.navigate(['/login']); // Chuta para a tela de login
          
          alert('Sua sessão expirou por segurança. Por favor, faça login novamente. 🔐');
        }
      }
      
      // Repassa o erro para frente caso outro componente queira saber
      return throwError(() => erro);
    })
  );
};

