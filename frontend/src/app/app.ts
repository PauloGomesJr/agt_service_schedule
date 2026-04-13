import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router'; // 1. <-- RouterModule ADICIONADO AQUI!

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. <-- RouterModule ADICIONADO NA LISTA ABAIXO:
  imports: [CommonModule, RouterOutlet, RouterModule], 
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'sistema-escala-transito';
}