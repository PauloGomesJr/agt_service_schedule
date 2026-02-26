import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor'; // Importe o interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Adicionamos o withInterceptors aqui:
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};