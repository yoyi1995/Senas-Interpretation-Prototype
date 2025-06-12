import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
//import { provideHttpClient } from '@angular/common/http'; // Importa provideHttpClient
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    //provideHttpClient() // Agrega esta línea para proveer el HttpClient
    provideHttpClient(withFetch())
  ]
};
