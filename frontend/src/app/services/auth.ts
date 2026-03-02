import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8081/auth';

  constructor(private http: HttpClient) { }

  login(credenciais: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(resposta => {
        if (resposta && resposta.token) {
          localStorage.setItem('token', resposta.token);
          // === NOVO: Salvamos também o nome de quem logou ===
          localStorage.setItem('usuarioLogado', credenciais.login); 
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  // === NOVO: Retorna o nome do usuário ===
  getUsuarioLogado(): string {
    return localStorage.getItem('usuarioLogado') || 'Usuário';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado'); // Limpa o nome ao sair
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}