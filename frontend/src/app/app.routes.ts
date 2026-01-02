import { Routes } from '@angular/router';
import { EscalaMensalComponent } from './components/escala-mensal/escala-mensal'; // Confirme se o caminho está certo
import { TiposServicoComponent } from './components/tipos-servico/tipos-servico'; // <--- O NOVO COMPONENTE

export const routes: Routes = [
  { path: '', component: EscalaMensalComponent },
  
  // AQUI ESTÁ A MÁGICA:
  { path: 'config', component: TiposServicoComponent } 
];
