import { Component } from '@angular/core';
// IMPORTANTE: O caminho do arquivo não tem .component no final
import { ServidorListaComponent } from './components/servidor-lista/servidor-lista'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ServidorListaComponent], // Adicione o componente aqui
  templateUrl: './app.html', // Verifique se seu arquivo é app.html ou app.component.html
  styleUrl: './app.scss' // Verifique se seu arquivo é app.scss ou app.component.scss
})
export class App {
  title = 'frontend';
}