import { Routes } from '@angular/router';
import { EscalaMensalComponent } from './components/escala-mensal/escala-mensal'; // Confirme se o caminho está certo
import { TiposServicoComponent } from './components/tipos-servico/tipos-servico'; // <--- O NOVO COMPONENTE

import { ServidoresComponent } from './components/servidores/servidores';

export const routes: Routes = [
  { path: '', redirectTo: 'escala', pathMatch: 'full' },
  { path: 'escala', component: EscalaMensalComponent },
  { path: 'config', component: TiposServicoComponent },
  { path: 'servidores', component: ServidoresComponent } 
];
