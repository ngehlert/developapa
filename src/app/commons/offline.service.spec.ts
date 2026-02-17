import { vi, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { OfflineService } from './offline.service';

function createMockWorker(initialState = 'installing') {
    const listeners: Record<string, Function[]> = {};
    const worker = {
        state: initialState,
        addEventListener: vi.fn((event: string, cb: Function) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(cb);
        }),
    };
    return {
        worker,
        setState(state: string) {
            (worker as any).state = state;
            (listeners['statechange'] || []).forEach((cb) => cb());
        },
    };
}

describe('OfflineService', () => {
    describe('on server platform', () => {
        let service: OfflineService;

        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [OfflineService, { provide: PLATFORM_ID, useValue: 'server' }],
            });
            service = TestBed.inject(OfflineService);
        });

        it('should create the service', () => {
            expect(service).toBeTruthy();
        });

        it('should default isOffline to false', () => {
            expect(service.isOffline()).toBe(false);
        });

        it('should default updateAvailable to false', () => {
            expect(service.updateAvailable()).toBe(false);
        });

        it('should default status to empty string', () => {
            expect(service.status()).toBe('');
        });

        it('enable() should set status to unsupported message', async () => {
            await service.enable();
            expect(service.status()).toBe('Service workers are not supported in this browser.');
        });

        it('enable() should not set isOffline to true', async () => {
            await service.enable();
            expect(service.isOffline()).toBe(false);
        });

        it('disable() should return early without error', async () => {
            await service.disable();
            expect(service.isOffline()).toBe(false);
        });

        it('reload() should not throw', () => {
            expect(() => service.reload()).not.toThrow();
        });
    });

    describe('on browser platform', () => {
        let service: OfflineService;
        let mockRegistration: {
            active: null | object;
            installing: null | object;
            unregister: ReturnType<typeof vi.fn>;
            addEventListener: ReturnType<typeof vi.fn>;
        };
        let swListeners: Record<string, Function[]>;
        let fetchSpy: ReturnType<typeof vi.fn>;

        function mockNgswState(driverState: string): void {
            fetchSpy.mockResolvedValue({
                text: () => Promise.resolve(`Driver state: ${driverState}\nSome other info`),
            });
        }

        function fireSwEvent(event: string): void {
            (swListeners[event] || []).forEach((cb) => cb());
        }

        beforeEach(() => {
            swListeners = {};
            mockRegistration = {
                active: null,
                installing: null,
                unregister: vi.fn().mockResolvedValue(true),
                addEventListener: vi.fn(),
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    controller: null,
                    register: vi.fn().mockResolvedValue(mockRegistration),
                    getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
                    addEventListener: vi.fn((event: string, cb: Function) => {
                        if (!swListeners[event]) swListeners[event] = [];
                        swListeners[event].push(cb);
                    }),
                },
                configurable: true,
                writable: true,
            });

            fetchSpy = vi.fn();
            vi.stubGlobal('fetch', fetchSpy);

            TestBed.configureTestingModule({
                providers: [OfflineService, { provide: PLATFORM_ID, useValue: 'browser' }],
            });
            service = TestBed.inject(OfflineService);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should set isOffline based on navigator.serviceWorker.controller', () => {
            expect(service.isOffline()).toBe(false);
        });

        it('should set isOffline to true if controller exists on construction', () => {
            (navigator.serviceWorker as any).controller = {};
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [OfflineService, { provide: PLATFORM_ID, useValue: 'browser' }],
            });
            const svc = TestBed.inject(OfflineService);
            expect(svc.isOffline()).toBe(true);
            (navigator.serviceWorker as any).controller = null;
        });

        describe('enable()', () => {
            it('should call navigator.serviceWorker.register', async () => {
                mockRegistration.active = {};
                (navigator.serviceWorker as any).controller = {};
                mockNgswState('NORMAL');

                await service.enable();
                expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/ngsw-worker.js');
            });

            it('should set isOffline and status when already active and healthy', async () => {
                mockRegistration.active = {};
                (navigator.serviceWorker as any).controller = {};
                mockNgswState('NORMAL');

                await service.enable();
                expect(service.isOffline()).toBe(true);
                expect(service.status()).toBe('Offline mode enabled. All content cached.');
            });

            it('should report error when already active but NGSW is degraded', async () => {
                mockRegistration.active = {};
                (navigator.serviceWorker as any).controller = {};
                mockNgswState('EXISTING_CLIENTS_ONLY');
                const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

                await service.enable();
                expect(service.isOffline()).toBe(false);
                expect(service.status()).toContain('failed to cache all content');
                consoleSpy.mockRestore();
            });

            it('should report error when health check fetch fails', async () => {
                mockRegistration.active = {};
                (navigator.serviceWorker as any).controller = {};
                fetchSpy.mockRejectedValue(new Error('Network error'));

                await service.enable();
                expect(service.isOffline()).toBe(false);
                expect(service.status()).toBe('Could not verify offline cache status.');
            });

            it('should detect successful new installation', async () => {
                const { worker, setState } = createMockWorker('installing');
                mockRegistration.installing = worker;
                mockNgswState('NORMAL');

                const enablePromise = service.enable();

                (navigator.serviceWorker as any).controller = worker;
                setState('activated');
                fireSwEvent('controllerchange');

                await enablePromise;
                expect(service.isOffline()).toBe(true);
                expect(service.status()).toBe('Offline mode enabled. All content cached.');
            });

            it('should detect installation failure when worker becomes redundant', async () => {
                const { worker, setState } = createMockWorker('installing');
                mockRegistration.installing = worker;

                const enablePromise = service.enable();
                setState('redundant');

                await enablePromise;
                expect(service.isOffline()).toBe(false);
                expect(service.status()).toBe(
                    'Failed to enable offline mode. Installation failed.',
                );
            });

            it('should wait for controllerchange when controller is not yet set', async () => {
                const { worker, setState } = createMockWorker('installing');
                mockRegistration.installing = worker;
                mockNgswState('NORMAL');

                const enablePromise = service.enable();

                // Activate without setting controller first
                setState('activated');

                // verifyNgswHealth waits for controllerchange
                // Simulate it after a tick
                await Promise.resolve();
                (navigator.serviceWorker as any).controller = worker;
                fireSwEvent('controllerchange');

                await enablePromise;
                expect(service.isOffline()).toBe(true);
            });

            it('should listen for updatefound on the registration', async () => {
                mockRegistration.active = {};
                (navigator.serviceWorker as any).controller = {};
                mockNgswState('NORMAL');

                await service.enable();
                expect(mockRegistration.addEventListener).toHaveBeenCalledWith(
                    'updatefound',
                    expect.any(Function),
                );
            });

            it('should set error status when registration fails', async () => {
                (
                    navigator.serviceWorker.register as ReturnType<typeof vi.fn>
                ).mockRejectedValue(new Error('Registration failed'));
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                await service.enable();
                expect(service.status()).toBe('Failed to enable offline mode.');
                consoleSpy.mockRestore();
            });
        });

        describe('disable()', () => {
            it('should unregister all service worker registrations', async () => {
                await service.disable();
                expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalled();
                expect(mockRegistration.unregister).toHaveBeenCalled();
            });

            it('should set isOffline to false', async () => {
                service.isOffline.set(true);
                await service.disable();
                expect(service.isOffline()).toBe(false);
            });

            it('should set updateAvailable to false', async () => {
                service.updateAvailable.set(true);
                await service.disable();
                expect(service.updateAvailable()).toBe(false);
            });

            it('should set status to disabled message', async () => {
                await service.disable();
                expect(service.status()).toBe('Offline mode disabled.');
            });
        });

        describe('reload()', () => {
            it('should call window.location.reload', () => {
                const reloadSpy = vi.fn();
                Object.defineProperty(window, 'location', {
                    value: { ...window.location, reload: reloadSpy },
                    configurable: true,
                    writable: true,
                });
                service.reload();
                expect(reloadSpy).toHaveBeenCalled();
            });
        });
    });
});
