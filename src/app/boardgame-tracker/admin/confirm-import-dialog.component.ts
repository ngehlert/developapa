import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
    summary: string;
}

@Component({
    selector: 'app-confirm-import-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <h2 mat-dialog-title>Confirm Import</h2>
        <mat-dialog-content>
            <p><strong>Warning:</strong> This will overwrite all existing data!</p>
            <p>File contains:</p>
            <pre class="summary">{{ data.summary }}</pre>
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
                Import
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            .summary {
                background: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                white-space: pre-wrap;
                font-family: inherit;
                font-size: 14px;
            }
        `,
    ],
    imports: [MatButtonModule, MatDialogModule],
})
export class ConfirmImportDialogComponent {
    public data = inject<DialogData>(MAT_DIALOG_DATA);
    private dialogRef = inject(MatDialogRef<ConfirmImportDialogComponent>);

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
