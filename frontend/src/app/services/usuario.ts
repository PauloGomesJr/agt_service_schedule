import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // Aponta para a nossa nova "Portaria" no Java
  private apiUrl = 'https://agt-service-schedule.onrender.com/api/usuarios';

  constructor(private http: HttpClient) { }

  // Busca quem está esperando aprovação
  listarPendentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pendentes`);
  }

  // Manda a ordem de aprovação
  aprovar(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/aprovar/${id}`, {});
  }
}