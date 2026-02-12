import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmOfflineDisableDialogComponent } from './confirm-offline-disable-dialog.component';

describe('ConfirmOfflineDisableDialogComponent', () => {
    let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        dialogRefSpy = { close: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [ConfirmOfflineDisableDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        }).compileComponents();
    });

    it('should close the dialog with false when Cancel is clicked', () => {
        const fixture = TestBed.createComponent(ConfirmOfflineDisableDialogComponent);
        fixture.detectChanges();
        const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        const cancelButton = Array.from(buttons).find((b) => b.textContent?.trim() === 'Cancel')!;
        cancelButton.click();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog with true when Disable & Reload is clicked', () => {
        const fixture = TestBed.createComponent(ConfirmOfflineDisableDialogComponent);
        fixture.detectChanges();
        const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
        const confirmButton = Array.from(buttons).find((b) => b.textContent?.includes('Disable'))!;
        confirmButton.click();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
});
