import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Escala, EscalaDTO } from '../models/escala.model';

@Injectable({
  providedIn: 'root'
})
export class EscalaService {

  private apiUrl = 'https://agt-service-schedule.onrender.com/api/escalas';

  constructor(private http: HttpClient) { }

  listar(): Observable<Escala[]> {
    return this.http.get<Escala[]>(this.apiUrl);
  }

  salvar(escala: EscalaDTO): Observable<Escala> {
    return this.http.post<Escala>(this.apiUrl, escala);
  }

  // Adicione este método na classe EscalaService
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Adicione este método na classe EscalaService
  permutar(origemId: number, destinoId: number): Observable<void> {
    const dto = {
      escalaOrigemId: origemId,
      escalaDestinoId: destinoId
    };
    return this.http.post<void>(`${this.apiUrl}/permutar`, dto);
  }

}