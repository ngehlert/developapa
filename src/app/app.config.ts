import {
    ApplicationConfig,
    ErrorHandler,
    inject,
    provideAppInitializer,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import * as Sentry from '@sentry/angular';
import { TraceService } from '@sentry/angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
        provideAppInitializer(async () => inject(TraceService)),
        {
            provide: ErrorHandler,
            useValue: Sentry.createErrorHandler(),
        },
    ],
};
