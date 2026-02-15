import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    PLATFORM_ID,
    afterNextRender,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AgGridEvent,
    AllCommunityModule,
    ColDef,
    ModuleRegistry,
    provideGlobalGridOptions,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { DataStorageService } from '../data-storage.service';
import { PlayedGame, Player } from '../types';
import { DecimalPipe, isPlatformBrowser, Location } from '@angular/common';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PasswordDialogComponent } from '../password-dialog.component';
import { TableEntry, buildGamesPerPlayer, buildRowData } from './scoring';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: 'legacy' });

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss',
    imports: [AgGridModule, MatIconButton, MatIcon],
    providers: [DecimalPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
    public agGrid = viewChild<AgGridAngular>('agGrid');

    public columnDefs: Array<ColDef> = [];
    public defaultColDef: ColDef = this.getDefaultColDef();
    public rowData: Array<TableEntry> = [];
    public players: Array<Player>;
    public isUnlocked = false;
    public readonly platformId = inject(PLATFORM_ID);
    public readonly isPlatformBrowser = isPlatformBrowser(this.platformId);

    public totalGames: number = 0;
    public totalUniqueGames: Set<string> = new Set();
    public gamesPerPlayer: Map<string, Array<[PlayedGame, number]>> = new Map();

    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);
    private location = inject(Location);
    private destroyRef = inject(DestroyRef);
    private store = inject(DataStorageService);
    private decimalPipe = inject(DecimalPipe);

    constructor() {
        this.players = this.store.getPlayers();
        this.gamesPerPlayer = buildGamesPerPlayer(this.store.getPlayedGames());

        this.columnDefs = this.getColumnDefs();
        this.rowData = this.getRowData();

        afterNextRender(() => {
            this.agGrid()?.gridReady.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.agGrid()?.api.sizeColumnsToFit();
            });
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
                this.cdr.detectChanges();
            } else {
                this.location.back();
            }
        });
    }

    public goBack(): void {
        this.location.back();
    }

    public onSortChanged(e: AgGridEvent) {
        e.api.refreshCells();
    }

    private getDefaultColDef(): ColDef {
        return {
            cellStyle: { 'text-align': 'right' },
            valueFormatter: (params: ValueFormatterParams) => {
                if (typeof params.value === 'number') {
                    return this.decimalPipe.transform(params.value);
                }

                return params.value;
            },
            sortable: true,
            sortingOrder: ['desc', 'asc'],
        };
    }

    private getRowData(): Array<TableEntry> {
        const result = buildRowData(this.players, this.store.getGames(), this.store.getPlayedGames());
        this.totalGames = result.totalGames;
        this.totalUniqueGames = result.totalUniqueGames;
        return result.rowData;
    }

    private getColumnDefs(): Array<ColDef> {
        return [
            {
                headerName: 'Place',
                valueGetter: 'node.rowIndex + 1',
                width: 50,
                sortable: false,
            },
            {
                headerName: 'Name',
                field: 'player.name',
                cellStyle: { 'text-align': 'left' },
            },
            {
                headerName: 'Total games',
                field: 'totalGames',
            },
            {
                headerName: 'Unique games',
                field: 'uniqueGames.size',
            },
            {
                headerName: 'Total points',
                field: 'score',
            },
            {
                headerName: 'Ø points',
                valueGetter(params: ValueGetterParams): number {
                    return params.data.score / (params.data.totalGames || 1);
                },
            },
            {
                headerName: 'Special category',
                valueGetter(params: ValueGetterParams): number {
                    const specialGames: Map<string, { score: number; timestamp: number }> = params.data.specialGames;

                    return Array.from(specialGames.values()).reduce((result, current) => {
                        return result + current.score;
                    }, 0);
                },
            },
        ];
    }

}

