import { Game, PlayedGame, Player } from '../types';

export interface TableEntry {
    player: Player;
    uniqueGames: Set<string>;
    totalGames: number;
    score: number;
    specialGames: Map<string, { score: number; timestamp: number }>;
}

export function getTotalAmountOfPlayers(placements: Array<Array<Player>>): number {
    return placements.reduce((result: number, current: Array<Player>) => {
        return result + current.length;
    }, 0);
}

export function calculateScore(
    game: Game,
    placementIndex: number,
    playersAtPlacement: number,
    totalAmountOfPlayers: number,
    amountOfTeamsInvolved: number,
): number {
    if (placementIndex > totalAmountOfPlayers) {
        totalAmountOfPlayers = placementIndex;
    }

    if (placementIndex > amountOfTeamsInvolved) {
        amountOfTeamsInvolved = placementIndex;
    }
    let score: number = 0;
    if (game.isCoopGame) {
        if (amountOfTeamsInvolved === 1) {
            // if there is only one team at least at a second game opponent for the point calculation to work properly
            amountOfTeamsInvolved = 2;
        }
        score = (amountOfTeamsInvolved - placementIndex) * game.duration;
    } else {
        for (let i: number = 0; i < playersAtPlacement; i++) {
            score += (totalAmountOfPlayers - placementIndex - i) * game.duration;
        }
        score = score / playersAtPlacement;
    }
    return score;
}

export function buildGamesPerPlayer(playedGames: Array<PlayedGame>): Map<string, Array<[PlayedGame, number]>> {
    const gamesPerPlayer: Map<string, Array<[PlayedGame, number]>> = new Map();
    playedGames.forEach((playedGame: PlayedGame) => {
        playedGame.placements.forEach((players: Array<Player>, index: number) => {
            players.forEach((player: Player) => {
                if (!gamesPerPlayer.has(player.name)) {
                    gamesPerPlayer.set(player.name, []);
                }
                gamesPerPlayer.get(player.name)?.push([playedGame, index + 1]);
            });
        });
    });
    return gamesPerPlayer;
}

export function buildRowData(
    players: Array<Player>,
    games: Array<Game>,
    playedGames: Array<PlayedGame>,
): { rowData: Array<TableEntry>; totalGames: number; totalUniqueGames: Set<string> } {
    const tableEntryByPlayerName: Map<string, TableEntry> = new Map();
    players.forEach((player: Player) => {
        tableEntryByPlayerName.set(player.name, {
            player,
            uniqueGames: new Set(),
            totalGames: 0,
            score: 0,
            specialGames: new Map(),
        });
    });

    const totalUniqueGames: Set<string> = new Set();
    let totalGames: number = 0;

    playedGames.forEach((playedGame: PlayedGame) => {
        const game: Game = games.find((current: Game) => current.name === playedGame.game.name) || playedGame.game;
        totalUniqueGames.add(game.name);
        totalGames++;
        playedGame.placements.forEach((placementPlayers: Array<Player>, index: number) => {
            placementPlayers.forEach((player: Player) => {
                const tableEntry: TableEntry | undefined = tableEntryByPlayerName.get(player.name);
                if (!tableEntry) {
                    return;
                }
                let amountOfTeamsInvolved: number = playedGame.placements.filter(
                    (players: Array<Player>) => players.length,
                ).length;
                const score = calculateScore(
                    game,
                    index,
                    placementPlayers.length,
                    getTotalAmountOfPlayers(playedGame.placements),
                    amountOfTeamsInvolved,
                );

                if (game.isSpecialGame) {
                    const existingEntry: { score: number; timestamp: number } | undefined =
                        tableEntry.specialGames.get(game.name);

                    if ((existingEntry && playedGame.timestamp < existingEntry.timestamp) || !existingEntry) {
                        tableEntry.specialGames.set(game.name, { timestamp: playedGame.timestamp, score });
                    }
                }

                tableEntry.uniqueGames.add(game.name);
                tableEntry.score += score;
                tableEntry.totalGames++;
            });
        });
    });

    return { rowData: Array.from(tableEntryByPlayerName.values()), totalGames, totalUniqueGames };
}
