import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servidor } from '../models/servidor.model';

@Injectable({
  providedIn: 'root'
})
export class ServidorService {
  // URL da API
  private apiUrl = 'https://agt-service-schedule.onrender.com/api/servidores';

  constructor(private http: HttpClient) { }

  // 1. Listar (GET)
  listar(): Observable<Servidor[]> {
    return this.http.get<Servidor[]>(this.apiUrl);
  }

  // 2. Cadastrar (POST)
  cadastrar(servidor: Servidor): Observable<Servidor> {
    return this.http.post<Servidor>(this.apiUrl, servidor);
  }

  // 3. Atualizar (PUT) - ADICIONADO AGORA
  atualizar(servidor: Servidor): Observable<Servidor> {
    // Precisamos passar o ID na URL: .../servidores/1
    return this.http.put<Servidor>(`${this.apiUrl}/${servidor.id}`, servidor);
  }

  // 4. Excluir (DELETE) - ADICIONADO AGORA
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}