import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Escala, EscalaDTO } from '../models/escala.model';

@Injectable({
  providedIn: 'root'
})
export class EscalaService {

  private apiUrl = 'http://localhost:8081/api/escalas';

  constructor(private http: HttpClient) { }

  listar(): Observable<Escala[]> {
    return this.http.get<Escala[]>(this.apiUrl);
  }

  salvar(escala: EscalaDTO): Observable<Escala> {
    return this.http.post<Escala>(this.apiUrl, escala);
  }
}