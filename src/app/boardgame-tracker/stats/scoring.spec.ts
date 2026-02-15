import { buildGamesPerPlayer, buildRowData, calculateScore, getTotalAmountOfPlayers } from './scoring';
import { Game, PlayedGame, Player } from '../types';

const GAME_20MIN: Game = { name: 'TestGame', duration: 20, isCoopGame: false, isSpecialGame: false };

describe('calculateScore', () => {
    describe('4 player game, each one with it\'s own placement', () => {
        const totalPlayers = 4;
        const teamsInvolved = 4;

        it('should give 80 points to 1st place', () => {
            expect(calculateScore(GAME_20MIN, 0, 1, totalPlayers, teamsInvolved)).toBe(80);
        });

        it('should give 60 points to 2nd place', () => {
            expect(calculateScore(GAME_20MIN, 1, 1, totalPlayers, teamsInvolved)).toBe(60);
        });

        it('should give 40 points to 3rd place', () => {
            expect(calculateScore(GAME_20MIN, 2, 1, totalPlayers, teamsInvolved)).toBe(40);
        });

        it('should give 20 points to 4th place', () => {
            expect(calculateScore(GAME_20MIN, 3, 1, totalPlayers, teamsInvolved)).toBe(20);
        });
    });

    describe('4 player game, 2nd and 3rd share a place', () => {
        const totalPlayers = 4;
        const teamsInvolved = 3;

        it('should give 80 points to 1st place', () => {
            expect(calculateScore(GAME_20MIN, 0, 1, totalPlayers, teamsInvolved)).toBe(80);
        });

        it('should give 50 points to shared 2nd place', () => {
            expect(calculateScore(GAME_20MIN, 1, 2, totalPlayers, teamsInvolved)).toBe(50);
        });

        it('should give 20 points to 4th place', () => {
            expect(calculateScore(GAME_20MIN, 3, 1, totalPlayers, teamsInvolved)).toBe(20);
        });
    });

    describe('4 player game, 3 players share 1st place', () => {
        const totalPlayers = 4;
        const teamsInvolved = 2;

        it('should give 60 points to each shared 1st place', () => {
            expect(calculateScore(GAME_20MIN, 0, 3, totalPlayers, teamsInvolved)).toBe(60);
        });

        it('should give 20 points to 4th place', () => {
            expect(calculateScore(GAME_20MIN, 3, 1, totalPlayers, teamsInvolved)).toBe(20);
        });
    });

    describe('coop game, 30 min duration', () => {
        const coopGame: Game = { name: 'CoopGame', duration: 30, isCoopGame: true, isSpecialGame: false };
        const totalPlayers = 2;
        const teamsInvolved = 2;

        it('should give 60 points to 1st place', () => {
            expect(calculateScore(coopGame, 0, 1, totalPlayers, teamsInvolved)).toBe(60);
        });

        it('should give 30 points to 2nd place', () => {
            expect(calculateScore(coopGame, 1, 1, totalPlayers, teamsInvolved)).toBe(30);
        });
    });

    describe('coop game, 30 min duration with just 1 team involved', () => {
        const coopGame: Game = { name: 'CoopGame', duration: 30, isCoopGame: true, isSpecialGame: false };
        const totalPlayers = 1;
        const teamsInvolved = 1;

        it('should give 60 points to 1st place', () => {
            expect(calculateScore(coopGame, 0, 1, totalPlayers, teamsInvolved)).toBe(60);
        });

        it('should give 30 points to 2nd place', () => {
            expect(calculateScore(coopGame, 1, 1, totalPlayers, teamsInvolved)).toBe(30);
        });
    });
});

function player(name: string): Player {
    return { name };
}

describe('getTotalAmountOfPlayers', () => {
    it('should return 4 for 4 entries with 1 player each', () => {
        const placements: Player[][] = [[player('A')], [player('B')], [player('C')], [player('D')]];
        expect(getTotalAmountOfPlayers(placements)).toBe(4);
    });

    it('should return 4 when trailing entries are empty', () => {
        const placements: Player[][] = [[player('A')], [player('B')], [player('C')], [player('D')], [], []];
        expect(getTotalAmountOfPlayers(placements)).toBe(4);
    });

    it('should return 4 when empty entries are in between', () => {
        const placements: Player[][] = [[player('A')], [], [player('B')], [], [player('C')], [player('D')]];
        expect(getTotalAmountOfPlayers(placements)).toBe(4);
    });

    it('should return 7 for mixed player counts per entry', () => {
        const placements: Player[][] = [
            [player('A')],
            [player('B'), player('C')],
            [player('D'), player('E'), player('F')],
            [player('G')],
        ];
        expect(getTotalAmountOfPlayers(placements)).toBe(7);
    });
});

describe('buildGamesPerPlayer', () => {
    const alice = player('Alice');
    const bob = player('Bob');
    const charlie = player('Charlie');
    const diana = player('Diana');

    const gameA: Game = { name: 'GameA', duration: 20, isCoopGame: false, isSpecialGame: false };
    const gameB: Game = { name: 'GameB', duration: 30, isCoopGame: false, isSpecialGame: false };
    const gameC: Game = { name: 'GameC', duration: 45, isCoopGame: false, isSpecialGame: false };

    // Game 1: Alice 1st, Bob 2nd, Charlie 3rd, Diana 4th
    const game1: PlayedGame = {
        game: gameA,
        timestamp: 1000,
        placements: [[alice], [bob], [charlie], [diana]],
    };

    // Game 2: Diana 1st, Charlie 2nd, Bob 3rd, Alice 4th
    const game2: PlayedGame = {
        game: gameB,
        timestamp: 2000,
        placements: [[diana], [charlie], [bob], [alice]],
    };

    // Game 3: Bob 1st, Alice 2nd, Diana 3rd, Charlie 4th
    const game3: PlayedGame = {
        game: gameC,
        timestamp: 3000,
        placements: [[bob], [alice], [diana], [charlie]],
    };

    const result = buildGamesPerPlayer([game1, game2, game3]);

    it('should contain all 4 players', () => {
        expect(result.size).toBe(4);
    });

    it('should have 3 entries per player', () => {
        expect(result.get('Alice')!.length).toBe(3);
        expect(result.get('Bob')!.length).toBe(3);
        expect(result.get('Charlie')!.length).toBe(3);
        expect(result.get('Diana')!.length).toBe(3);
    });

    it('should track Alice as 1st, 4th, 2nd', () => {
        const aliceGames = result.get('Alice')!;
        expect(aliceGames[0]).toEqual([game1, 1]);
        expect(aliceGames[1]).toEqual([game2, 4]);
        expect(aliceGames[2]).toEqual([game3, 2]);
    });

    it('should track Bob as 2nd, 3rd, 1st', () => {
        const bobGames = result.get('Bob')!;
        expect(bobGames[0]).toEqual([game1, 2]);
        expect(bobGames[1]).toEqual([game2, 3]);
        expect(bobGames[2]).toEqual([game3, 1]);
    });

    it('should track Charlie as 3rd, 2nd, 4th', () => {
        const charlieGames = result.get('Charlie')!;
        expect(charlieGames[0]).toEqual([game1, 3]);
        expect(charlieGames[1]).toEqual([game2, 2]);
        expect(charlieGames[2]).toEqual([game3, 4]);
    });

    it('should track Diana as 4th, 1st, 3rd', () => {
        const dianaGames = result.get('Diana')!;
        expect(dianaGames[0]).toEqual([game1, 4]);
        expect(dianaGames[1]).toEqual([game2, 1]);
        expect(dianaGames[2]).toEqual([game3, 3]);
    });
});

describe('buildRowData', () => {
    const alice = player('Alice');
    const bob = player('Bob');
    const charlie = player('Charlie');
    const diana = player('Diana');
    const eve = player('Eve');
    const frank = player('Frank');

    const allPlayers = [alice, bob, charlie, diana, eve, frank];

    const chess: Game = { name: 'Chess', duration: 20, isCoopGame: false, isSpecialGame: false };
    const catan: Game = { name: 'Catan', duration: 30, isCoopGame: false, isSpecialGame: false };
    const pandemic: Game = { name: 'Pandemic', duration: 40, isCoopGame: false, isSpecialGame: false };

    const allGames = [chess, catan, pandemic];

    // Game 1: Chess — Alice 1st, Bob 2nd, Charlie 3rd, Diana 4th
    const played1: PlayedGame = {
        game: chess,
        timestamp: 1000,
        placements: [[alice], [bob], [charlie], [diana]],
    };

    // Game 2: Catan — Eve 1st, Alice 2nd, Frank 3rd, Bob 4th
    const played2: PlayedGame = {
        game: catan,
        timestamp: 2000,
        placements: [[eve], [alice], [frank], [bob]],
    };

    // Game 3: Pandemic — Frank 1st, Diana 2nd, Eve 3rd, Charlie 4th
    const played3: PlayedGame = {
        game: pandemic,
        timestamp: 3000,
        placements: [[frank], [diana], [eve], [charlie]],
    };

    // Game 4: Chess again — Charlie 1st, Frank 2nd, Eve 3rd, Alice 4th
    const played4: PlayedGame = {
        game: chess,
        timestamp: 4000,
        placements: [[charlie], [frank], [eve], [alice]],
    };

    // Game 5: Catan again — Bob 1st, Diana 2nd, Charlie 3rd, Frank 4th
    const played5: PlayedGame = {
        game: catan,
        timestamp: 5000,
        placements: [[bob], [diana], [charlie], [frank]],
    };

    const playedGames = [played1, played2, played3, played4, played5];
    const { rowData, totalGames, totalUniqueGames } = buildRowData(allPlayers, allGames, playedGames);

    function getEntry(name: string) {
        return rowData.find((e) => e.player.name === name)!;
    }

    it('should report 5 total games played', () => {
        expect(totalGames).toBe(5);
    });

    it('should report 3 total unique games', () => {
        expect(totalUniqueGames.size).toBe(3);
        expect(totalUniqueGames).toEqual(new Set(['Chess', 'Catan', 'Pandemic']));
    });

    it('should have an entry for each of the 6 players', () => {
        expect(rowData.length).toBe(6);
    });

    // Alice: Chess1(1st)=80, Catan1(2nd)=90, Chess2(4th)=20 → 190, 3 games, 2 unique
    it('should calculate Alice correctly', () => {
        const entry = getEntry('Alice');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Catan']));
        expect(entry.score).toBe(190);
    });

    // Bob: Chess1(2nd)=60, Catan1(4th)=30, Catan2(1st)=120 → 210, 3 games, 2 unique
    it('should calculate Bob correctly', () => {
        const entry = getEntry('Bob');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Catan']));
        expect(entry.score).toBe(210);
    });

    // Charlie: Chess1(3rd)=40, Pandemic(4th)=40, Chess2(1st)=80, Catan2(3rd)=60 → 220, 4 games, 3 unique
    it('should calculate Charlie correctly', () => {
        const entry = getEntry('Charlie');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Pandemic', 'Catan']));
        expect(entry.score).toBe(220);
    });

    // Diana: Chess1(4th)=20, Pandemic(2nd)=120, Catan2(2nd)=90 → 230, 3 games, 3 unique
    it('should calculate Diana correctly', () => {
        const entry = getEntry('Diana');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Pandemic', 'Catan']));
        expect(entry.score).toBe(230);
    });

    // Eve: Catan1(1st)=120, Pandemic(3rd)=80, Chess2(3rd)=40 → 240, 3 games, 3 unique
    it('should calculate Eve correctly', () => {
        const entry = getEntry('Eve');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames).toEqual(new Set(['Catan', 'Pandemic', 'Chess']));
        expect(entry.score).toBe(240);
    });

    // Frank: Catan1(3rd)=60, Pandemic(1st)=160, Chess2(2nd)=60, Catan2(4th)=30 → 310, 4 games, 3 unique
    it('should calculate Frank correctly', () => {
        const entry = getEntry('Frank');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Catan', 'Pandemic', 'Chess']));
        expect(entry.score).toBe(310);
    });
});

describe('buildRowData special games', () => {
    const alice = player('Alice');
    const bob = player('Bob');
    const charlie = player('Charlie');
    const diana = player('Diana');
    const eve = player('Eve');
    const frank = player('Frank');

    const allPlayers = [alice, bob, charlie, diana, eve, frank];

    const chess: Game = { name: 'Chess', duration: 20, isCoopGame: false, isSpecialGame: false };
    const catan: Game = { name: 'Catan', duration: 30, isCoopGame: false, isSpecialGame: false };
    const pandemic: Game = { name: 'Pandemic', duration: 40, isCoopGame: false, isSpecialGame: true };
    const risk: Game = { name: 'Risk', duration: 25, isCoopGame: false, isSpecialGame: true };

    const allGames = [chess, catan, pandemic, risk];

    // Game 1: Chess (non-special) — Alice 1st, Bob 2nd, Charlie 3rd, Diana 4th
    const played1: PlayedGame = {
        game: chess,
        timestamp: 1000,
        placements: [[alice], [bob], [charlie], [diana]],
    };

    // Game 2: Pandemic (special) — Eve 1st, Alice 2nd, Frank 3rd, Bob 4th
    const played2: PlayedGame = {
        game: pandemic,
        timestamp: 2000,
        placements: [[eve], [alice], [frank], [bob]],
    };

    // Game 3: Risk (special) — Charlie 1st, Diana 2nd, Frank 3rd, Eve 4th
    const played3: PlayedGame = {
        game: risk,
        timestamp: 3000,
        placements: [[charlie], [diana], [frank], [eve]],
    };

    // Game 4: Pandemic again (special, 2nd time) — Diana 1st, Frank 2nd, Eve 3rd, Charlie 4th
    const played4: PlayedGame = {
        game: pandemic,
        timestamp: 4000,
        placements: [[diana], [frank], [eve], [charlie]],
    };

    // Game 5: Catan (non-special) — Alice 1st, Bob 2nd, Charlie 3rd, Eve 4th
    const played5: PlayedGame = {
        game: catan,
        timestamp: 5000,
        placements: [[alice], [bob], [charlie], [eve]],
    };

    // Game 6: Risk again (special, 2nd time) — Bob 1st, Frank 2nd, Alice 3rd, Eve 4th
    const played6: PlayedGame = {
        game: risk,
        timestamp: 6000,
        placements: [[bob], [frank], [alice], [eve]],
    };

    const playedGames = [played1, played2, played3, played4, played5, played6];
    const { rowData } = buildRowData(allPlayers, allGames, playedGames);

    function getEntry(name: string) {
        return rowData.find((e) => e.player.name === name)!;
    }

    it('should not include non-special games in specialGames map', () => {
        for (const entry of rowData) {
            expect(entry.specialGames.has('Chess')).toBe(false);
            expect(entry.specialGames.has('Catan')).toBe(false);
        }
    });

    it('should only include special games in specialGames map', () => {
        for (const entry of rowData) {
            for (const key of entry.specialGames.keys()) {
                expect(['Pandemic', 'Risk']).toContain(key);
            }
        }
    });

    // Alice: Pandemic(t=2000, 2nd=120), Risk(t=6000, 3rd=50) — each played once
    it('should store both special games for Alice', () => {
        const sg = getEntry('Alice').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Pandemic')).toEqual({ score: 120, timestamp: 2000 });
        expect(sg.get('Risk')).toEqual({ score: 50, timestamp: 6000 });
    });

    // Bob: Pandemic(t=2000, 4th=40), Risk(t=6000, 1st=100) — each played once
    it('should store both special games for Bob', () => {
        const sg = getEntry('Bob').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Pandemic')).toEqual({ score: 40, timestamp: 2000 });
        expect(sg.get('Risk')).toEqual({ score: 100, timestamp: 6000 });
    });

    // Charlie: Risk(t=3000, 1st=100), Pandemic(t=4000, 4th=40) — each played once
    it('should store both special games for Charlie', () => {
        const sg = getEntry('Charlie').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Risk')).toEqual({ score: 100, timestamp: 3000 });
        expect(sg.get('Pandemic')).toEqual({ score: 40, timestamp: 4000 });
    });

    // Diana: Risk(t=3000, 2nd=75), Pandemic(t=4000, 1st=160) — each played once
    it('should store both special games for Diana', () => {
        const sg = getEntry('Diana').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Risk')).toEqual({ score: 75, timestamp: 3000 });
        expect(sg.get('Pandemic')).toEqual({ score: 160, timestamp: 4000 });
    });

    // Eve: Pandemic played at t=2000(1st=160) and t=4000(3rd=80) → keeps t=2000
    //      Risk played at t=3000(4th=25) and t=6000(4th=25) → keeps t=3000
    it('should keep only the earliest Pandemic and Risk for Eve', () => {
        const sg = getEntry('Eve').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Pandemic')).toEqual({ score: 160, timestamp: 2000 });
        expect(sg.get('Risk')).toEqual({ score: 25, timestamp: 3000 });
    });

    // Frank: Pandemic played at t=2000(3rd=80) and t=4000(2nd=120) → keeps t=2000
    //        Risk played at t=3000(3rd=50) and t=6000(2nd=75) → keeps t=3000
    it('should keep only the earliest Pandemic and Risk for Frank', () => {
        const sg = getEntry('Frank').specialGames;
        expect(sg.size).toBe(2);
        expect(sg.get('Pandemic')).toEqual({ score: 80, timestamp: 2000 });
        expect(sg.get('Risk')).toEqual({ score: 50, timestamp: 3000 });
    });
});

describe('buildRowData shared placements', () => {
    const alice = player('Alice');
    const bob = player('Bob');
    const charlie = player('Charlie');
    const diana = player('Diana');
    const eve = player('Eve');
    const frank = player('Frank');

    const allPlayers = [alice, bob, charlie, diana, eve, frank];

    const chess: Game = { name: 'Chess', duration: 20, isCoopGame: false, isSpecialGame: false };
    const catan: Game = { name: 'Catan', duration: 30, isCoopGame: false, isSpecialGame: false };
    const pandemic: Game = { name: 'Pandemic', duration: 40, isCoopGame: false, isSpecialGame: false };

    const allGames = [chess, catan, pandemic];

    // Game 1: Chess (4 players) — Alice & Bob share 1st, Charlie 3rd, Diana 4th
    // Alice & Bob (idx=0, shared=2): ((4-0-0)*20 + (4-0-1)*20) / 2 = (80+60)/2 = 70
    // Charlie (idx=2): (4-2)*20 = 40
    // Diana (idx=3): (4-3)*20 = 20
    const played1: PlayedGame = {
        game: chess,
        timestamp: 1000,
        placements: [[alice, bob], [], [charlie], [diana]],
    };

    // Game 2: Catan (5 players) — Eve 1st, Charlie & Diana & Frank share 2nd, Alice 5th
    // Eve (idx=0): (5-0)*30 = 150
    // Charlie, Diana, Frank (idx=1, shared=3): ((5-1-0)*30 + (5-1-1)*30 + (5-1-2)*30) / 3 = (120+90+60)/3 = 90
    // Alice (idx=4): (5-4)*30 = 30
    const played2: PlayedGame = {
        game: catan,
        timestamp: 2000,
        placements: [[eve], [charlie, diana, frank], [], [], [alice]],
    };

    // Game 3: Pandemic (4 players) — Frank 1st, Eve & Alice share 2nd, Bob 4th
    // Frank (idx=0): (4-0)*40 = 160
    // Eve & Alice (idx=1, shared=2): ((4-1-0)*40 + (4-1-1)*40) / 2 = (120+80)/2 = 100
    // Bob (idx=3): (4-3)*40 = 40
    const played3: PlayedGame = {
        game: pandemic,
        timestamp: 3000,
        placements: [[frank], [eve, alice], [], [bob]],
    };

    // Game 4: Chess (6 players) — Diana 1st, Bob & Eve share 2nd, Charlie & Frank share 4th, Alice 6th
    // Diana (idx=0): (6-0)*20 = 120
    // Bob & Eve (idx=1, shared=2): ((6-1-0)*20 + (6-1-1)*20) / 2 = (100+80)/2 = 90
    // Charlie & Frank (idx=3, shared=2): ((6-3-0)*20 + (6-3-1)*20) / 2 = (60+40)/2 = 50
    // Alice (idx=5): (6-5)*20 = 20
    const played4: PlayedGame = {
        game: chess,
        timestamp: 4000,
        placements: [[diana], [bob, eve], [], [charlie, frank], [], [alice]],
    };

    // Game 5: Catan (4 players) — Bob 1st, Frank 2nd, Diana 3rd, Charlie 4th (no sharing)
    // Bob (idx=0): (4-0)*30 = 120
    // Frank (idx=1): (4-1)*30 = 90
    // Diana (idx=2): (4-2)*30 = 60
    // Charlie (idx=3): (4-3)*30 = 30
    const played5: PlayedGame = {
        game: catan,
        timestamp: 5000,
        placements: [[bob], [frank], [diana], [charlie]],
    };

    const playedGames = [played1, played2, played3, played4, played5];
    const { rowData } = buildRowData(allPlayers, allGames, playedGames);

    function getEntry(name: string) {
        return rowData.find((e) => e.player.name === name)!;
    }

    // Alice: Chess1=70, Catan1=30, Pandemic=100, Chess2=20 → 220, 4 games, 3 unique
    it('should calculate Alice with shared 1st and shared 2nd correctly', () => {
        const entry = getEntry('Alice');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Catan', 'Pandemic']));
        expect(entry.score).toBe(220);
    });

    // Bob: Chess1=70, Pandemic=40, Chess2=90, Catan2=120 → 320, 4 games, 3 unique
    it('should calculate Bob with shared 1st and shared 2nd correctly', () => {
        const entry = getEntry('Bob');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Pandemic', 'Catan']));
        expect(entry.score).toBe(320);
    });

    // Charlie: Chess1=40, Catan1=90, Chess2=50, Catan2=30 → 210, 4 games, 2 unique
    it('should calculate Charlie with three-way shared and two-way shared correctly', () => {
        const entry = getEntry('Charlie');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Catan']));
        expect(entry.score).toBe(210);
    });

    // Diana: Chess1=20, Catan1=90, Chess2=120, Catan2=60 → 290, 4 games, 2 unique
    it('should calculate Diana with three-way shared correctly', () => {
        const entry = getEntry('Diana');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Catan']));
        expect(entry.score).toBe(290);
    });

    // Eve: Catan1=150, Pandemic=100, Chess2=90 → 340, 3 games, 3 unique
    it('should calculate Eve with shared 2nd placements correctly', () => {
        const entry = getEntry('Eve');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames).toEqual(new Set(['Catan', 'Pandemic', 'Chess']));
        expect(entry.score).toBe(340);
    });

    // Frank: Catan1=90, Pandemic=160, Chess2=50, Catan2=90 → 390, 4 games, 3 unique
    it('should calculate Frank with three-way shared and two-way shared correctly', () => {
        const entry = getEntry('Frank');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Catan', 'Pandemic', 'Chess']));
        expect(entry.score).toBe(390);
    });
});

describe('buildRowData coop games', () => {
    const alice = player('Alice');
    const bob = player('Bob');
    const charlie = player('Charlie');
    const diana = player('Diana');
    const eve = player('Eve');
    const frank = player('Frank');

    const allPlayers = [alice, bob, charlie, diana, eve, frank];

    const chess: Game = { name: 'Chess', duration: 20, isCoopGame: false, isSpecialGame: false };
    const catan: Game = { name: 'Catan', duration: 30, isCoopGame: false, isSpecialGame: false };
    const pandemic: Game = { name: 'Pandemic', duration: 40, isCoopGame: true, isSpecialGame: false };
    const spiritIsland: Game = { name: 'Spirit Island', duration: 30, isCoopGame: true, isSpecialGame: false };

    const allGames = [chess, catan, pandemic, spiritIsland];

    // Game 1: Pandemic (coop, d=40) — 2 teams: Alice & Bob win, Charlie & Diana lose
    // teams=2, idx=0: (2-0)*40=80 each, idx=1: (2-1)*40=40 each
    const played1: PlayedGame = {
        game: pandemic,
        timestamp: 1000,
        placements: [[alice, bob], [charlie, diana]],
    };

    // Game 2: Chess (non-coop, d=20) — Eve & Frank share 1st, Alice 3rd, Bob 4th
    // totalPlayers=4, teams=3, idx=0 shared=2: ((4-0)*20+(4-1)*20)/2=70, idx=2: 40, idx=3: 20
    const played2: PlayedGame = {
        game: chess,
        timestamp: 2000,
        placements: [[eve, frank], [], [alice], [bob]],
    };

    // Game 3: Spirit Island (coop, d=30) — 3 teams of 2
    // teams=3, idx=0: (3-0)*30=90, idx=1: (3-1)*30=60, idx=2: (3-2)*30=30
    const played3: PlayedGame = {
        game: spiritIsland,
        timestamp: 3000,
        placements: [[eve, frank], [charlie, diana], [alice, bob]],
    };

    // Game 4: Catan (non-coop, d=30) — Diana & Eve share 2nd
    // totalPlayers=4, teams=3, idx=0: 120, idx=1 shared=2: ((4-1)*30+(4-2)*30)/2=75, idx=3: 30
    const played4: PlayedGame = {
        game: catan,
        timestamp: 4000,
        placements: [[charlie], [diana, eve], [], [frank]],
    };

    // Game 5: Pandemic (coop, d=40) — 2 teams: trio wins, duo loses
    // teams=2, idx=0: (2-0)*40=80 each, idx=1: (2-1)*40=40 each
    const played5: PlayedGame = {
        game: pandemic,
        timestamp: 5000,
        placements: [[charlie, diana, eve], [frank, bob]],
    };

    // Game 6: Chess (non-coop, d=20) — no sharing
    // totalPlayers=4, teams=4, idx=0: 80, idx=1: 60, idx=2: 40, idx=3: 20
    const played6: PlayedGame = {
        game: chess,
        timestamp: 6000,
        placements: [[diana], [charlie], [frank], [eve]],
    };

    const playedGames = [played1, played2, played3, played4, played5, played6];
    const { rowData } = buildRowData(allPlayers, allGames, playedGames);

    function getEntry(name: string) {
        return rowData.find((e) => e.player.name === name)!;
    }

    // Alice: Pandemic(coop,1st)=80, Chess(shared 1st)=40 (non-coop 3rd place), Spirit Island(coop,3rd)=30
    // Total: 80+40+30 = 150, 3 games, 3 unique
    it('should calculate Alice with coop wins and non-coop placement', () => {
        const entry = getEntry('Alice');
        expect(entry.totalGames).toBe(3);
        expect(entry.uniqueGames.size).toBe(3);
        expect(entry.score).toBe(150);
    });

    // Bob: Pandemic(coop,1st)=80, Chess(4th)=20, Spirit Island(coop,3rd)=30, Pandemic(coop,2nd)=40
    // Total: 80+20+30+40 = 170, 4 games, 3 unique
    it('should calculate Bob with coop on both sides', () => {
        const entry = getEntry('Bob');
        expect(entry.totalGames).toBe(4);
        expect(entry.uniqueGames).toEqual(new Set(['Pandemic', 'Chess', 'Spirit Island']));
        expect(entry.score).toBe(170);
    });

    // Charlie: Pandemic(coop,2nd)=40, Spirit Island(coop,2nd)=60, Catan(1st)=120, Pandemic(coop,1st)=80, Chess(2nd)=60
    // Total: 40+60+120+80+60 = 360, 5 games, 4 unique
    it('should calculate Charlie with mix of coop losses, wins, and non-coop', () => {
        const entry = getEntry('Charlie');
        expect(entry.totalGames).toBe(5);
        expect(entry.uniqueGames).toEqual(new Set(['Pandemic', 'Spirit Island', 'Catan', 'Chess']));
        expect(entry.score).toBe(360);
    });

    // Diana: Pandemic(coop,2nd)=40, Spirit Island(coop,2nd)=60, Catan(shared 2nd)=75, Pandemic(coop,1st)=80, Chess(1st)=80
    // Total: 40+60+75+80+80 = 335, 5 games, 4 unique
    it('should calculate Diana with coop teams and non-coop shared placement', () => {
        const entry = getEntry('Diana');
        expect(entry.totalGames).toBe(5);
        expect(entry.uniqueGames).toEqual(new Set(['Pandemic', 'Spirit Island', 'Catan', 'Chess']));
        expect(entry.score).toBe(335);
    });

    // Eve: Chess(shared 1st)=70, Spirit Island(coop,1st)=90, Catan(shared 2nd)=75, Pandemic(coop,1st)=80, Chess(4th)=20
    // Total: 70+90+75+80+20 = 335, 5 games, 4 unique
    it('should calculate Eve with coop 1st and non-coop shared placements', () => {
        const entry = getEntry('Eve');
        expect(entry.totalGames).toBe(5);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Spirit Island', 'Catan', 'Pandemic']));
        expect(entry.score).toBe(335);
    });

    // Frank: Chess(shared 1st)=70, Spirit Island(coop,1st)=90, Catan(4th)=30, Pandemic(coop,2nd)=40, Chess(3rd)=40
    // Total: 70+90+30+40+40 = 270, 5 games, 4 unique
    it('should calculate Frank with coop 1st, coop 2nd, and non-coop shared', () => {
        const entry = getEntry('Frank');
        expect(entry.totalGames).toBe(5);
        expect(entry.uniqueGames).toEqual(new Set(['Chess', 'Spirit Island', 'Catan', 'Pandemic']));
        expect(entry.score).toBe(270);
    });
});

describe('calculateScore negative value safeguard', () => {
    const normalGame: Game = { name: 'TestGame', duration: 20, isCoopGame: false, isSpecialGame: false };
    const coopGame: Game = { name: 'CoopGame', duration: 30, isCoopGame: true, isSpecialGame: false };

    describe('non-coop: placementIndex exceeds totalAmountOfPlayers', () => {
        it('should not return a negative score when placementIndex > totalPlayers', () => {
            // 4 players but placement index 5 (6th place) — without guard this would be (4-5)*20 = -20
            const score = calculateScore(normalGame, 5, 1, 4, 4);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('should not return a negative score when placementIndex equals totalPlayers', () => {
            // 4 players, index 4 (5th place, 0-based) — without guard: (4-4)*20 = 0, borderline
            const score = calculateScore(normalGame, 4, 1, 4, 4);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('should not return a negative score with a single player beyond total players', () => {
            // 3 players but index 5 — guard clamps totalPlayers to 5, score = (5-5)*20 = 0
            const score = calculateScore(normalGame, 5, 1, 3, 3);
            expect(score).toBeGreaterThanOrEqual(0);
        });
    });

    describe('coop: placementIndex exceeds amountOfTeamsInvolved', () => {
        it('should not return a negative score when placementIndex > teams involved', () => {
            // 2 teams but placement index 3 — without guard: (2-3)*30 = -30
            const score = calculateScore(coopGame, 3, 1, 4, 2);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('should not return a negative score when placementIndex equals teams involved', () => {
            // 2 teams, index 2 — without guard: (2-2)*30 = 0, borderline
            const score = calculateScore(coopGame, 2, 1, 4, 2);
            expect(score).toBeGreaterThanOrEqual(0);
        });
    });

    describe('both guards triggered simultaneously', () => {
        it('should not return a negative for non-coop when index exceeds both totals', () => {
            // 2 players, 2 teams, but index 5
            const score = calculateScore(normalGame, 5, 1, 2, 2);
            expect(score).toBeGreaterThanOrEqual(0);
        });

        it('should not return a negative for coop when index exceeds both totals', () => {
            // 2 players, 2 teams, but index 5
            const score = calculateScore(coopGame, 5, 1, 2, 2);
            expect(score).toBeGreaterThanOrEqual(0);
        });
    });
});
