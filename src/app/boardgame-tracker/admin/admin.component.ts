import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, afterNextRender } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { DataStorageService } from '../data-storage.service';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlayedGame, Player } from '../types';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { ConfirmImportDialogComponent } from './confirm-import-dialog.component';
import { PasswordDialogComponent } from '../password-dialog.component';
import { StorageData } from '../types';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss',
    imports: [
        DragDropModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatCardModule,
        MatListModule,
        MatCheckboxModule,
        MatDialogModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
    public playedGamesList: Array<PlayedGame> = [];
    public isUnlocked = false;
    private dialog = inject(MatDialog);
    private location = inject(Location);
    private cdr = inject(ChangeDetectorRef);
    private document = inject(DOCUMENT);
    private store = inject(DataStorageService);

    constructor() {
        this.loadPlayedGames();
        afterNextRender(() => {
            this.showPasswordDialog();
        });
    }

    public showPasswordDialog(): void {
        const dialogRef = this.dialog.open(PasswordDialogComponent, {
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((success: boolean) => {
            if (success) {
                this.isUnlocked = true;
                this.cdr.markForCheck();
            } else {
                this.location.back();
            }
        });
    }

    public goBack(): void {
        this.location.back();
    }

    private loadPlayedGames(): void {
        this.playedGamesList = this.store.getPlayedGames().sort((a, b) => b.timestamp - a.timestamp);
    }

    public formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    public formatPlayers(playedGame: PlayedGame): string {
        const playerStrings: Array<string> = [];
        playedGame.placements.forEach((placementGroup: Array<Player>, index: number) => {
            const placement = index + 1;
            placementGroup.forEach((player: Player) => {
                playerStrings.push(`${player.name} (${placement})`);
            });
        });
        return playerStrings.join(', ');
    }

    public confirmDelete(playedGame: PlayedGame): void {
        const summary = `${this.formatDate(playedGame.timestamp)} - ${playedGame.game.name}\nPlayers: ${this.formatPlayers(playedGame)}`;

        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
            data: { summary },
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.store.removePlayedGame(playedGame);
                this.loadPlayedGames();
                this.cdr.markForCheck();
            }
        });
    }

    public exportData(): void {
        const data = this.store.load();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date();
        const dateString = date.toISOString().split('T')[0];
        const filename = `saved-data-${dateString}.json`;

        const link = this.document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    public onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string) as StorageData;
                this.confirmImport(data);
            } catch (error) {
                alert('Invalid JSON file');
            }
            input.value = '';
        };

        reader.readAsText(file);
    }

    private confirmImport(data: StorageData): void {
        const summary = `Players: ${data.players?.length || 0}\nGames: ${data.games?.length || 0}\nPlayed Games: ${data.playedGames?.length || 0}`;

        const dialogRef = this.dialog.open(ConfirmImportDialogComponent, {
            data: { summary },
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                if (data.players) {
                    this.store.dangerouslySetPlayers(data.players);
                }
                if (data.games) {
                    this.store.dangerouslySetGames(data.games);
                }
                if (data.playedGames) {
                    this.store.dangerouslySetPlayedGames(data.playedGames);
                }
                this.loadPlayedGames();
                this.cdr.markForCheck();
            }
        });
    }
}
