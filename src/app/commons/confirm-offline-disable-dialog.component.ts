import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-offline-disable-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <h2 mat-dialog-title>Disable Offline Mode</h2>
        <mat-dialog-content>
            <p>
                This will unregister the service worker and clear the offline cache. The page will
                reload afterwards.
            </p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button
                mat-button
                (click)="onCancel()"
            >
                Cancel
            </button>
            <button
                mat-raised-button
                color="warn"
                (click)="onConfirm()"
            >
                Disable &amp; Reload
            </button>
        </mat-dialog-actions>
    `,
    imports: [MatButtonModule, MatDialogModule],
})
export class ConfirmOfflineDisableDialogComponent {
    private dialogRef = inject(MatDialogRef<ConfirmOfflineDisableDialogComponent>);

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
