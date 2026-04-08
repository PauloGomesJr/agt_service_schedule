import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Determinacao } from '../models/determinacao'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class DeterminacaoService {
  
  // Link oficial da sua API no Render
  private apiUrl = 'https://agt-service-schedule.onrender.com/api/determinacoes';

  constructor(private http: HttpClient) {}

  // Busca todas as determinações cadastradas (Apenas Admin)
  listarTodas(): Observable<Determinacao[]> {
    return this.http.get<Determinacao[]>(this.apiUrl, { withCredentials: true });
  }

  // Busca as determinações específicas de um dia/escala
  buscarPorEscala(escalaId: number): Observable<Determinacao[]> {
    return this.http.get<Determinacao[]>(`${this.apiUrl}/escala/${escalaId}`, { withCredentials: true });
  }

  // Salva uma nova determinação vinculando-a a uma escala
  salvar(determinacao: Determinacao): Observable<Determinacao> {
    return this.http.post<Determinacao>(this.apiUrl, determinacao, { withCredentials: true });
  }

  // Exclui uma determinação que foi cadastrada errada
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}