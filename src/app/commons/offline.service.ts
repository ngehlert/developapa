import { Injectable, PLATFORM_ID, inject, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class OfflineService {
    private platformId = inject(PLATFORM_ID);

    public isOffline: WritableSignal<boolean> = signal(false);
    public updateAvailable: WritableSignal<boolean> = signal(false);
    public status: WritableSignal<string> = signal('');

    constructor() {
        if (isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator) {
            this.isOffline.set(!!navigator.serviceWorker.controller);
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.isOffline.set(!!navigator.serviceWorker.controller);
            });
        }
    }

    public async enable(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !('serviceWorker' in navigator)) {
            this.status.set('Service workers are not supported in this browser.');
            return;
        }

        try {
            this.status.set('Enabling offline mode...');
            const registration: ServiceWorkerRegistration =
                await navigator.serviceWorker.register('/ngsw-worker.js');

            if (registration.active && !registration.installing) {
                this.listenForUpdates(registration);
                await this.verifyNgswHealth();
                return;
            }

            const activated = await this.waitForActivation(registration);

            if (!activated) {
                this.status.set('Failed to enable offline mode. Installation failed.');
                return;
            }

            this.listenForUpdates(registration);
            await this.verifyNgswHealth();
        } catch (error) {
            this.status.set('Failed to enable offline mode.');
            console.error('Service worker registration failed:', error);
        }
    }

    public async disable(): Promise<void> {
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

    private waitForActivation(registration: ServiceWorkerRegistration): Promise<boolean> {
        return new Promise((resolve) => {
            const track = (worker: ServiceWorker): void => {
                if (worker.state === 'activated') {
                    resolve(true);
                    return;
                }
                if (worker.state === 'redundant') {
                    resolve(false);
                    return;
                }
                worker.addEventListener('statechange', () => {
                    if (worker.state === 'activated') {
                        resolve(true);
                    } else if (worker.state === 'redundant') {
                        resolve(false);
                    }
                });
            };

            const worker = registration.installing || registration.waiting;
            if (worker) {
                track(worker);
            } else {
                registration.addEventListener(
                    'updatefound',
                    () => {
                        if (registration.installing) {
                            track(registration.installing);
                        }
                    },
                    { once: true },
                );
            }
        });
    }

    private async verifyNgswHealth(attempt = 1): Promise<void> {
        // Wait for the SW registration to have an active worker
        await navigator.serviceWorker.ready;

        try {
            const response = await fetch('/ngsw/state');
            const text = await response.text();
            if (text.includes('Driver state: NORMAL')) {
                this.isOffline.set(true);
                this.status.set('Offline mode enabled. All content cached.');
                return;
            }
            if (attempt < 3) {
                await new Promise((r) => setTimeout(r, 1000));
                return this.verifyNgswHealth(attempt + 1);
            }
            this.isOffline.set(false);
            this.status.set(
                'Service worker is active but failed to cache all content. Try disabling and re-enabling.',
            );
            console.warn('NGSW state:\n', text);
        } catch {
            if (attempt < 3) {
                await new Promise((r) => setTimeout(r, 1000));
                return this.verifyNgswHealth(attempt + 1);
            }
            this.isOffline.set(false);
            this.status.set('Could not verify offline cache status.');
        }
    }

    private listenForUpdates(registration: ServiceWorkerRegistration): void {
        registration.addEventListener('updatefound', () => {
            const newWorker: ServiceWorker | null = registration.installing;
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
