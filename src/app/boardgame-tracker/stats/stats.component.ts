import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {
  AgGridEvent,
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  provideGlobalGridOptions,
  ValueFormatterParams,
  ValueGetterParams
} from 'ag-grid-community';
import {DataStorageService} from '../data-storage.service';
import {Game, PlayedGame, Player} from '../types';
import {CommonModule, DecimalPipe} from '@angular/common';
import {AgGridAngular, AgGridModule} from 'ag-grid-angular';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy"});

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
  ],
  providers: [
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent implements OnInit {
  @ViewChild('agGrid', {static: true}) public agGrid!: AgGridAngular;

  public columnDefs: Array<ColDef> = [];
  public defaultColDef: ColDef = this.getDefaultColDef();
  public rowData: Array<TableEntry> = [];
  public players: Array<Player>;

  public totalGames: number = 0;
  public totalUniqueGames: Set<string> = new Set();
  public gamesPerPlayer: Map<string, Array<[PlayedGame, number]>> = new Map();

  constructor(
    private store: DataStorageService,
    private decimalPipe: DecimalPipe,
  ) {
    this.players = this.store.getPlayers();
    this.store.getPlayedGames().forEach((playedGame: PlayedGame) => {
      playedGame.placements.forEach((players: Array<Player>, index: number) => {
        players.forEach((player: Player) => {
          if (!this.gamesPerPlayer.has(player.name)) {
            this.gamesPerPlayer.set(player.name, []);
          }
          this.gamesPerPlayer.get(player.name)?.push([playedGame, index + 1]);
        })
      });
    });
  }

  ngOnInit(): void {
    this.columnDefs = this.getColumnDefs();
    this.rowData = this.getRowData();

    this.agGrid.gridReady.subscribe((() => {
      this.agGrid.api.sizeColumnsToFit();
    }));
  }

  public onSortChanged(e: AgGridEvent) {
    e.api.refreshCells();
  }

  private getDefaultColDef(): ColDef {
    return {
      cellStyle: {'text-align': 'right'},
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
    const tableEntryByPlayerName: Map<string, TableEntry> = new Map();
    this.players.forEach((player: Player) => {
      tableEntryByPlayerName.set(player.name, {
        player,
        uniqueGames: new Set(),
        totalGames: 0,
        score: 0,
        specialGames: new Map(),
      });
    });
    const games: Array<Game> = this.store.getGames();

    this.store.getPlayedGames().forEach((playedGame: PlayedGame) => {
      const totalAmountOfPlayers: number = this.getTotalAmountOfPlayers(playedGame.placements);

      const game: Game = games.find((current: Game) => current.name === playedGame.game.name) || playedGame.game;
      const gameTime: number = game.duration;
      this.totalUniqueGames.add(game.name);
      this.totalGames++;
      playedGame.placements.forEach((players: Array<Player>, index: number) => {
        players.forEach((player: Player) => {
          const tableEntry: TableEntry | undefined = tableEntryByPlayerName.get(player.name);
          if (!tableEntry) {
            return;
          }
          let score: number = 0;
          if (players.length === 1 || game.isCoopGame) {
            const amountOfTeamsInvolved: number = playedGame.placements.filter((players: Array<Player>) => players.length).length;
            score = (amountOfTeamsInvolved - index) * gameTime;
          } else {
            for (let i: number = 0; i < players.length; i++) {
              score += (totalAmountOfPlayers - index - i) * gameTime;
            }
            score = score / players.length;
          }

          if (game.isSpecialGame) {
            const existingEntry: {score: number; timestamp: number} | undefined = tableEntry.specialGames.get(game.name);

            if ((existingEntry && playedGame.timestamp < existingEntry.timestamp) || !existingEntry) {
              tableEntry.specialGames.set(game.name, {timestamp: playedGame.timestamp, score});
            }
          }

          tableEntry.uniqueGames.add(game.name);
          tableEntry.score += score;
          tableEntry.totalGames++;
        });
      });
    });

    return Array.from(tableEntryByPlayerName.values());
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
        cellStyle: {'text-align': 'left'},
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
        }
      },
      {
        headerName: 'Special category',
        valueGetter(params: ValueGetterParams): number {
          const specialGames: Map<string, {score: number; timestamp: number}> = params.data.specialGames;

          return Array.from(specialGames.values()).reduce((result, current) => {
            return result + current.score;
          }, 0);
        }
      },
    ];
  }

  private getTotalAmountOfPlayers(placements: Array<Array<Player>>): number {
    return placements.reduce((result: number, current: Array<Player>) => {
      return result + current.length;
    }, 0);
  }
}

interface TableEntry {
  player: Player;
  uniqueGames: Set<string>;
  totalGames: number;
  score: number;
  specialGames: Map<string, {score: number; timestamp: number}>;
}
