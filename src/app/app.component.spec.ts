import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FullscreenService } from './boardgame-tracker/fullscreen.service';
import { OfflineService } from './commons/offline.service';

describe('AppComponent', () => {
    let fullscreenService: FullscreenService;
    let offlineService: OfflineService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [provideRouter([]), provideZonelessChangeDetection()],
        }).compileComponents();

        fullscreenService = TestBed.inject(FullscreenService);
        offlineService = TestBed.inject(OfflineService);
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it(`should have the 'Developapa' title`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        expect(fixture.componentInstance.title).toEqual('Developapa');
    });

    it('should set the document title on creation', () => {
        TestBed.createComponent(AppComponent);
        const titleService = TestBed.inject(Title);
        expect(titleService.getTitle()).toEqual('Developapa');
    });

    it('should render title in h1', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h1')?.textContent).toContain('Developapa');
    });

    it('should render the current year in footer', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const footer = fixture.nativeElement.querySelector('footer') as HTMLElement;
        const currentYear = new Date().getFullYear().toString();
        expect(footer.textContent).toContain(currentYear);
    });

    it('should render footer links for privacy policy, terms, and impressum', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const footer = fixture.nativeElement.querySelector('footer') as HTMLElement;
        const links = footer.querySelectorAll('a');
        const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
        expect(hrefs).toContain('/privacy-policy');
        expect(hrefs).toContain('/terms');
        expect(hrefs).toContain('/impressum');
    });

    it('should have a home link on the logo heading', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const h1Link = fixture.nativeElement.querySelector('h1 a') as HTMLAnchorElement;
        expect(h1Link.getAttribute('href')).toBe('/');
    });

    it('should render the logo image', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const img = fixture.nativeElement.querySelector('header img') as HTMLImageElement;
        expect(img).toBeTruthy();
        expect(img.alt).toBe('Developapa Logo');
    });

    it('should render the portfolio rollerblade link', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const link = fixture.nativeElement.querySelector('a.rollerblade-icon') as HTMLAnchorElement;
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe('/portfolio');
        expect(link.querySelector('svg')).toBeTruthy();
    });

    it('should contain a router-outlet', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    });

    describe('fullscreen mode', () => {
        it('should hide header, footer, and rollerblade icon when fullscreen', () => {
            fullscreenService.isFullscreen.set(true);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const el = fixture.nativeElement as HTMLElement;
            expect(el.querySelector('header')!.classList).toContain('hidden');
            expect(el.querySelector('footer')!.classList).toContain('hidden');
            expect(el.querySelector('a.rollerblade-icon')!.classList).toContain('hidden');
        });

        it('should show header, footer, and rollerblade icon when not fullscreen', () => {
            fullscreenService.isFullscreen.set(false);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const el = fixture.nativeElement as HTMLElement;
            expect(el.querySelector('header')!.classList).not.toContain('hidden');
            expect(el.querySelector('footer')!.classList).not.toContain('hidden');
            expect(el.querySelector('a.rollerblade-icon')!.classList).not.toContain('hidden');
        });
    });

    describe('offline mode', () => {
        it('should not show offline badge when not offline', () => {
            offlineService.isOffline.set(false);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('.offline-badge')).toBeNull();
        });

        it('should show offline badge when offline', () => {
            offlineService.isOffline.set(true);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const badge = fixture.nativeElement.querySelector('.offline-badge') as HTMLElement;
            expect(badge).toBeTruthy();
            expect(badge.textContent).toContain('Offline mode');
        });

        it('should not show update button when no update available', () => {
            offlineService.isOffline.set(true);
            offlineService.updateAvailable.set(false);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const updateBtn = fixture.nativeElement.querySelector('button[aria-label="Update available - Reload"]');
            expect(updateBtn).toBeNull();
        });

        it('should show update button when update is available', () => {
            offlineService.isOffline.set(true);
            offlineService.updateAvailable.set(true);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const updateBtn = fixture.nativeElement.querySelector('button[aria-label="Update available - Reload"]');
            expect(updateBtn).toBeTruthy();
        });

        it('should call offlineService.reload when update button is clicked', () => {
            offlineService.isOffline.set(true);
            offlineService.updateAvailable.set(true);
            const reloadSpy = vi.spyOn(offlineService, 'reload').mockImplementation(() => {});
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const updateBtn = fixture.nativeElement.querySelector(
                'button[aria-label="Update available - Reload"]',
            ) as HTMLButtonElement;
            updateBtn.click();
            expect(reloadSpy).toHaveBeenCalled();
        });

        it('should call disableOffline when offline badge is clicked', () => {
            offlineService.isOffline.set(true);
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const disableSpy = vi.spyOn(fixture.componentInstance, 'disableOffline').mockResolvedValue();
            const badge = fixture.nativeElement.querySelector('.offline-badge') as HTMLButtonElement;
            badge.click();
            expect(disableSpy).toHaveBeenCalled();
        });
    });
});
