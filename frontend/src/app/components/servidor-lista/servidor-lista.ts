import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importe ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ServidorService } from '../../services/servidor.service';
import { Servidor } from '../../models/servidor.model';

@Component({
  selector: 'app-servidor-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servidor-lista.html',
  styleUrl: './servidor-lista.scss'
})
export class ServidorListaComponent implements OnInit {

  servidores: Servidor[] = [];

  // 2. Injete o ChangeDetectorRef no construtor
  constructor(
    private servidorService: ServidorService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.carregarServidores();
  }

  carregarServidores(): void {
    this.servidorService.listar().subscribe({
      next: (dados) => {
        this.servidores = dados;
        console.log('Dados recebidos e atribuídos:', this.servidores);
        
        // 3. A MÁGICA: Força o Angular a atualizar a tela AGORA
        this.cdr.detectChanges(); 
      },
      error: (erro) => {
        console.error('Erro:', erro);
        alert('Erro de conexão.');
      }
    });
  }
}