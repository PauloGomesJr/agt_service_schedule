import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Mantemos o import do seu modelo existente!
import { TipoServico } from '../models/tipo-servico.model';

@Injectable({
  providedIn: 'root'
})
export class TipoServicoService {
  
  private apiUrl = 'http://localhost:8081/api/tipos-servico';

  constructor(private http: HttpClient) { }

  listar(): Observable<TipoServico[]> {
    return this.http.get<TipoServico[]>(this.apiUrl);
  }

  // A lógica "inteligente": Se tem ID é Edição (PUT), se não tem é Criação (POST)
  salvar(tipo: TipoServico): Observable<TipoServico> {
    if (tipo.id) {
      return this.http.put<TipoServico>(`${this.apiUrl}/${tipo.id}`, tipo);
    } else {
      return this.http.post<TipoServico>(this.apiUrl, tipo);
    }
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}