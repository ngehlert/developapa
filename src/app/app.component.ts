import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { FullscreenService } from './boardgame-tracker/fullscreen.service';
import { OfflineService } from './commons/offline.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, NgOptimizedImage, MatTooltip],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'Developapa';
    currentYear = signal(new Date().getFullYear());
    fullscreenService = inject(FullscreenService);
    offlineService = inject(OfflineService);
}
