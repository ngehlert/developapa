interface Player {
    name: string;
}

interface Game {
    name: string;
    duration: number;
    isCoopGame: boolean;
    isSpecialGame: boolean;
}

interface StorageData {
    players: Array<Player>;
    games: Array<Game>;
    playedGames: Array<PlayedGame>;
}

interface PlayedGame {
    placements: Array<Array<Player>>;
    game: Game;
    timestamp: number;
}

export {
    type Player,
    type Game,
    type PlayedGame,
    type StorageData
}
