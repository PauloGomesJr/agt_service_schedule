import { Component } from '@angular/core';
// import { ServidorListaComponent } from './components/servidor-lista/servidor-lista'; <-- Remova este
import { EscalaMensalComponent } from './components/escala-mensal/escala-mensal'; // <-- Adicione este

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EscalaMensalComponent], // <-- Atualize aqui
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'frontend';
}