import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servidor } from '../models/servidor.model';

@Injectable({
  providedIn: 'root'
})
export class ServidorService {
  // URL da API que criamos no Spring Boot
  private apiUrl = 'http://localhost:8081/api/servidores';

  constructor(private http: HttpClient) { }

  // Busca a lista completa de servidores
  listar(): Observable<Servidor[]> {
    return this.http.get<Servidor[]>(this.apiUrl);
  }

  // Envia um novo servidor para o banco
  cadastrar(servidor: Servidor): Observable<Servidor> {
    return this.http.post<Servidor>(this.apiUrl, servidor);
  }
}
