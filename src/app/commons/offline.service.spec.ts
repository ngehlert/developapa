import { vi, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { OfflineService } from './offline.service';

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

        beforeEach(() => {
            mockRegistration = {
                active: null,
                installing: null,
                unregister: vi.fn().mockResolvedValue(true),
                addEventListener: vi.fn(),
            };

            // Stub navigator.serviceWorker
            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    controller: null,
                    register: vi.fn().mockResolvedValue(mockRegistration),
                    getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
                    addEventListener: vi.fn(),
                },
                configurable: true,
                writable: true,
            });

            TestBed.configureTestingModule({
                providers: [OfflineService, { provide: PLATFORM_ID, useValue: 'browser' }],
            });
            service = TestBed.inject(OfflineService);
        });

        it('should set isOffline based on navigator.serviceWorker.controller', () => {
            // controller is null, so isOffline should be false
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
            it('should set status to enabling message', async () => {
                await service.enable();
                expect(service.status()).toBeTruthy();
            });

            it('should call navigator.serviceWorker.register', async () => {
                await service.enable();
                expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/ngsw-worker.js');
            });

            it('should set isOffline and status when registration is already active', async () => {
                mockRegistration.active = {};
                await service.enable();
                expect(service.isOffline()).toBe(true);
                expect(service.status()).toBe('Offline mode enabled. All content cached.');
            });

            it('should not set isOffline when registration has no active worker', async () => {
                mockRegistration.active = null;
                await service.enable();
                // isOffline stays false unless updatefound fires with activated state
                expect(service.isOffline()).toBe(false);
            });

            it('should set error status when registration fails', async () => {
                (navigator.serviceWorker.register as ReturnType<typeof vi.fn>).mockRejectedValue(
                    new Error('Registration failed'),
                );
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
                await service.enable();
                expect(service.status()).toBe('Failed to enable offline mode.');
                consoleSpy.mockRestore();
            });

            it('should listen for updatefound on the registration', async () => {
                await service.enable();
                expect(mockRegistration.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function));
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
