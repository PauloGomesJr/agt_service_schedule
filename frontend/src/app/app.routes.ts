import { Routes } from '@angular/router';

// Suas páginas existentes
import { EscalaMensalComponent } from './components/escala-mensal/escala-mensal';
import { TiposServicoComponent } from './components/tipos-servico/tipos-servico';
import { ServidoresComponent } from './components/servidores/servidores';

// Novas importações de Segurança
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth-guard';
import { PainelUsuariosComponent } from './components/painel-usuarios/painel-usuarios';
import { AdminGuard } from './guards/admin-guard';
import { RegistroComponent } from './components/registro/registro';

export const routes: Routes = [
  // 1. Rota raiz agora joga para o Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. Rotas Públicas (Livres para todos)
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // 3. Suas rotas protegidas (Só entra se o authGuard deixar)
  { path: 'escala', component: EscalaMensalComponent, canActivate: [authGuard] },
  { path: 'config', component: TiposServicoComponent, canActivate: [authGuard] },
  { path: 'servidores', component: ServidoresComponent, canActivate: [authGuard] },
  
  // 4. Rota Administrativa (A Mágica da Portaria)
  { path: 'painel-usuarios', component: PainelUsuariosComponent, canActivate: [AdminGuard] },
  
  // 5. A Rota Curinga DEVE ser sempre a última! Se digitar URL maluca, volta pro Login
  { path: '**', redirectTo: 'login' }
];