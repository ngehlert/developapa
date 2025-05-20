import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Sentry from '@sentry/angular';
import { browserTracingIntegration, replayIntegration } from '@sentry/angular';

Sentry.init({
    dsn: 'https://2b7277ec914f43308d9f9ac19b63fe77@o299372.ingest.us.sentry.io/1639743',
    integrations: [
        browserTracingIntegration(),
        replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        })
    ],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    tracesSampleRate: 0.25,
    tracePropagationTargets: ['localhost', /^https:\/\/developapa\.com\//],
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
);
