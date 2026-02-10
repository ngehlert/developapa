import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-password-dialog',
    template: `
        <h2 mat-dialog-title>Enter Password</h2>
        <mat-dialog-content>
            <mat-form-field
                appearance="outline"
                class="password-field"
            >
                <mat-label>Password</mat-label>
                <input
                    matInput
                    type="password"
                    [(ngModel)]="password"
                    (keyup.enter)="onSubmit()"
                />
            </mat-form-field>
            @if (error()) {
                <p class="error">Invalid password</p>
            }
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
                color="primary"
                (click)="onSubmit()"
            >
                Submit
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            .error {
                color: #f44336;
                margin: 0;
                font-size: 14px;
            }
            .password-field {
                width: 100%;
                margin-top: 16px;
            }
        `,
    ],
    imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordDialogComponent {
    public password = '';
    public error = signal(false);
    private dialogRef = inject(MatDialogRef<PasswordDialogComponent>);

    private readonly passwordHash = 'b1735cd401709051194b97ee74e7b27f2a579209d1866b1b0a1bd448576c3034';

    onCancel(): void {
        this.dialogRef.close(false);
    }

    async onSubmit(): Promise<void> {
        const encoder = new TextEncoder();
        const data = encoder.encode(this.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex === this.passwordHash) {
            this.dialogRef.close(true);
        } else {
            this.error.set(true);
        }
    }
}
