import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// REMOVA O IMPORT DO ESCALA MENSAL AQUI DE CIMA (se tiver)

@Component({
  selector: 'app-root',
  standalone: true,
  // REMOVA O EscalaMensalComponent DESTA LISTA ABAIXO:
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'sistema-escala-transito';
}