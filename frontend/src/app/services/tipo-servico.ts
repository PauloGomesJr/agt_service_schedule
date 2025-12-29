import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Método extra caso precisemos cadastrar tipos pelo front no futuro
  cadastrar(tipo: TipoServico): Observable<TipoServico> {
    return this.http.post<TipoServico>(this.apiUrl, tipo);
  }
}
