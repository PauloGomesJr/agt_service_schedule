import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'https://agt-service-schedule.onrender.com/auth';

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

// ... suas outras funções (login, logout, getUsuarioLogado) ...

  // Lê o Token JWT e extrai a permissão (Role)
  getRole(): any {
    const token = this.getToken();
    if (token) {
      try {
        const payload = token.split('.')[1];
        // Correção para caracteres especiais no Base64 do JWT
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(base64));
        
        // Vamos colocar um espião no F12 para você ver como o Java manda a permissão!
        console.log('Espião do Token JWT:', decodedPayload);
        
        // Pega os formatos mais comuns que o Spring Security usa
        return decodedPayload.role || decodedPayload.authorities || decodedPayload.roles || '';
      } catch (e) {
        console.error('Erro ao ler token:', e);
        return '';
      }
    }
    return '';
  }

  // Atalho para saber se é chefe (Agora muito mais inteligente)
  isAdmin(): boolean {
    const role = this.getRole();
    // Transforma qualquer coisa que vier do Java em texto e procura a palavra 'ADMIN'.
    // Assim, ele aceita 'ADMIN', 'ROLE_ADMIN', ['ROLE_ADMIN'], etc.
    return JSON.stringify(role).toUpperCase().includes('ADMIN');
  }

}