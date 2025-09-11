import { Component } from '@angular/core';
import { DataStorageService } from '../data-storage.service';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        MatCardModule,
        MatListModule,
        MatCheckboxModule,
    ],
})
export class AdminComponent {
    public players: string;
    public games: string;
    public playedGames: string;

    constructor(private store: DataStorageService) {
        this.players = JSON.stringify(this.store.getPlayers(), null, 4);
        this.games = JSON.stringify(this.store.getGames(), null, 4);
        this.playedGames = JSON.stringify(this.store.getPlayedGames(), null, 4);
    }

    public updatePlayers(): void {
        try {
            this.store.dangerouslySetPlayers(JSON.parse(this.players));
        } catch (error) {
            alert(error);
        }
    }

    public updateGames(): void {
        try {
            this.store.dangerouslySetGames(JSON.parse(this.games));
        } catch (error) {
            alert(error);
        }
    }
    public updatePlayedGames(): void {
        try {
            this.store.dangerouslySetPlayedGames(JSON.parse(this.playedGames));
        } catch (error) {
            alert(error);
        }
    }
}
