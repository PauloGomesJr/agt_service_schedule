import { ApplicationConfig, LOCALE_ID } from '@angular/core'; // Adicione o LOCALE_ID
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor'; // O seu interceptor

// === 1. IMPORTAÇÕES DO IDIOMA PORTUGUÊS ===
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// === 2. REGISTRA O IDIOMA NO ANGULAR ===
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // === 3. AVISA O SISTEMA PARA USAR O PT-BR COMO PADRÃO ===
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};