import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class OfflineService {
    private platformId = inject(PLATFORM_ID);

    public isOffline = signal(false);
    public updateAvailable = signal(false);
    public status = signal('');

    constructor() {
        if (isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator) {
            this.isOffline.set(!!navigator.serviceWorker.controller);
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.isOffline.set(!!navigator.serviceWorker.controller);
            });
        }
    }

    async enable(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !('serviceWorker' in navigator)) {
            this.status.set('Service workers are not supported in this browser.');
            return;
        }

        try {
            this.status.set('Enabling offline mode...');
            const registration = await navigator.serviceWorker.register('/ngsw-worker.js');

            this.listenForUpdates(registration);

            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                worker?.addEventListener('statechange', () => {
                    if (worker.state === 'activated') {
                        this.isOffline.set(true);
                        this.status.set('Offline mode enabled. All content cached.');
                    }
                });
            });

            if (registration.active) {
                this.isOffline.set(true);
                this.status.set('Offline mode enabled. All content cached.');
                this.listenForUpdates(registration);
            }
        } catch (error) {
            this.status.set('Failed to enable offline mode.');
            console.error('Service worker registration failed:', error);
        }
    }

    async disable(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !('serviceWorker' in navigator)) {
            return;
        }

        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
        }
        this.isOffline.set(false);
        this.updateAvailable.set(false);
        this.status.set('Offline mode disabled.');
    }

    public reload(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
        }
    }

    private listenForUpdates(registration: ServiceWorkerRegistration): void {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) {
                return;
            }
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.updateAvailable.set(true);
                }
            });
        });
    }
}
