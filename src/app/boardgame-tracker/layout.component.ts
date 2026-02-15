import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RulesDialogComponent } from './main/rules.component';
import { FullscreenService } from './fullscreen.service';

@Component({
    selector: 'app-boardgame-layout',
    template: `
        <nav class="nav-bar">
            <div class="nav-links">
                <a matButton="outlined" routerLink="main" routerLinkActive="active">Main</a>
                <a matButton="outlined" routerLink="stats" routerLinkActive="active">Stats</a>
                <a matButton="outlined" routerLink="admin" routerLinkActive="active">Admin</a>
            </div>
            <div class="nav-actions">
                <button mat-icon-button matTooltip="Fullscreen" (click)="toggleFullscreen()">
                    <mat-icon>{{ fullscreenService.isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Rules" (click)="openRulesDialog()">
                    <mat-icon>description</mat-icon>
                </button>
            </div>
        </nav>
        <router-outlet />
    `,
    styles: [
        `
            .nav-bar {
                display: flex;
                justify-content: space-between;
                margin: 0 0 12px 0;
            }
            .nav-links,
            .nav-actions {
                display: flex;
                gap: 4px;
            }
            .active {
                background-color: var(--mat-sys-primary);
                color: var(--mat-sys-on-primary) !important;
            }

            a {
                text-decoration: none;
            }
        `,
    ],
    imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardgameLayoutComponent {
    public fullscreenService = inject(FullscreenService);
    private dialog = inject(MatDialog);

    public toggleFullscreen(): void {
        this.fullscreenService.toggle();
    }

    public openRulesDialog(): void {
        this.dialog.open(RulesDialogComponent, {});
    }
}
