import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DialogData {
    summary: string;
}

@Component({
    selector: 'app-confirm-delete-dialog',
    template: `
        <h2 mat-dialog-title>Confirm Delete</h2>
        <mat-dialog-content>
            <p>Are you sure you want to delete this game?</p>
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
                Delete
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
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
})
export class ConfirmDeleteDialogComponent {
    public data = inject<DialogData>(MAT_DIALOG_DATA);
    private dialogRef = inject(MatDialogRef<ConfirmDeleteDialogComponent>);

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
