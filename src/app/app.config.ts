import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  // global services availabl for entire app
  providers: [
    provideZonelessChangeDetection(), // performance optimization
    provideRouter(routes), // routing configuration
    provideFirebaseApp(() => initializeApp(environment.firebase)), // firebase configuration
    provideAuth(() => getAuth()), // authentication configuration
  ],
};
