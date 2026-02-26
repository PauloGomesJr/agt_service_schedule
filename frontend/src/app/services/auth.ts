import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // URL do nosso novo endpoint no Java
  private apiUrl = 'http://localhost:8081/auth';

  constructor(private http: HttpClient) { }

  login(credenciais: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciais).pipe(
      tap(resposta => {
        // Quando o Java devolver o token, nós guardamos no cofre do navegador
        if (resposta && resposta.token) {
          localStorage.setItem('token', resposta.token);
        }
      })
    );
  }

  // Pega a chave do cofre
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Joga a chave fora (Sair do sistema)
  logout(): void {
    localStorage.removeItem('token');
  }

  // Verifica se o usuário tem a chave
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}