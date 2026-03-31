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

export const routes: Routes = [
  // 1. Rota raiz agora joga para o Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. Rota de Login (Livre para todos)
  { path: 'login', component: LoginComponent },
  
  // 3. Suas rotas protegidas (Só entra se o authGuard deixar)
  { path: 'escala', component: EscalaMensalComponent, canActivate: [authGuard] },
  { path: 'config', component: TiposServicoComponent, canActivate: [authGuard] },
  { path: 'servidores', component: ServidoresComponent, canActivate: [authGuard] },
  
  // 4. Se o usuário digitar qualquer URL maluca, volta pro Login
  { path: '**', redirectTo: 'login' },

  // Dentro do seu array de rotas (Routes):
{ 
  path: 'painel-usuarios', 
  component: PainelUsuariosComponent, 
  canActivate: [AdminGuard] // <--- A Mágica acontece aqui
}
];