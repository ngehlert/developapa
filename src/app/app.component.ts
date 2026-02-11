import { ChangeDetectionStrategy, Component, inject, Injector, signal, WritableSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { FullscreenService } from './boardgame-tracker/fullscreen.service';
import { OfflineService } from './commons/offline.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        NgOptimizedImage,
        MatTooltip,
        MatIcon,
        MatIconButton,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public title: string = 'Developapa';
    public currentYear: WritableSignal<number> = signal(new Date().getFullYear());
    protected fullscreenService: FullscreenService = inject(FullscreenService);
    protected offlineService: OfflineService = inject(OfflineService);
    private injector = inject(Injector);
    private titleService = inject(Title);

    constructor() {
        this.titleService.setTitle(this.title);
    }

    async disableOffline(): Promise<void> {
        const { MatDialog } = await import('@angular/material/dialog');
        const { ConfirmOfflineDisableDialogComponent } = await import(
            './commons/confirm-offline-disable-dialog.component'
        );
        const dialog = this.injector.get(MatDialog);
        dialog
            .open(ConfirmOfflineDisableDialogComponent, { width: '400px' })
            .afterClosed()
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.offlineService.disable().then(() => this.offlineService.reload());
                }
            });
    }
}
