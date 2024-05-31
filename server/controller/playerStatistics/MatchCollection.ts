import { IMatch, RRMap, WinningPlayer } from "~/utils/interfaces/IMatch";

type CacheKey = "winrate" | "mapWinrate";

export default class MatchCollection {
    private matches: IMatch[];
    private nonForfeitMatches: IMatch[];
    private cache: Map<CacheKey, unknown>;

    constructor(matches: IMatch[]) {
        this.matches = matches;
        this.nonForfeitMatches = matches.filter(wasMatchNotForfeit);
        this.cache = new Map();
    }

    private getCachedOrCalculate<T>(key: CacheKey, calculator: () => T): T {
        if (!this.cache.has(key)) {
            this.cache.set(key, calculator());
        }
        return this.cache.get(key) as T;
    }

    winrate(player: string): number {
        return this.getCachedOrCalculate("winrate", () => {
            const wins = this.nonForfeitMatches.filter((m) =>
                hasPlayerWon(player, m),
            ).length;
            const ties = this.nonForfeitMatches.filter(wasMatchTie).length;

            return (wins + 0.5 * ties) / this.nonForfeitMatches.length;
        });
    }

    mapWinrate(player: string): number {
        return this.getCachedOrCalculate("mapWinrate", () => {
            const wins = this.matches
                .map((match) => {
                    return match.playedMaps
                        .filter(wasMapNotForfeit)
                        .filter((map) => wasMapWonBy(player, match, map))
                        .length;
                })
                .reduce((a, b) => a + b, 0);
            const ties = this.matches
                .map((match) => {
                    return match.playedMaps
                        .filter(wasMapNotForfeit)
                        .filter(wasMapTie).length;
                })
                .reduce((a, b) => a + b, 0);
            const maps = this.matches
                .map((match) => {
                    return match.playedMaps.filter(wasMapNotForfeit).length;
                })
                .reduce((a, b) => a + b, 0);

            return (wins + 0.5 * ties) / maps;
        });
    }
}

// Filter functions
function wasMatchNotForfeit(match: IMatch): boolean {
    return match.playerOneScore + match.playerTwoScore > 1;
}

function wasMapNotForfeit(map: RRMap): boolean {
    return map.forfeit !== true;
}

function hasPlayerWon(player: string, match: IMatch): boolean {
    return (
        (match.playerOne === player &&
            match.playerOneScore > match.playerTwoScore) ||
        (match.playerTwo === player &&
            match.playerTwoScore > match.playerOneScore)
    );
}

function wasMatchTie(match: IMatch): boolean {
    return match.playerOneScore === match.playerTwoScore;
}

function wasMapWonBy(player: string, match: IMatch, map: RRMap): boolean {
    return (
        (map.winner === WinningPlayer.PLAYER_ONE &&
            match.playerOne === player) ||
        (map.winner === WinningPlayer.PLAYER_TWO && match.playerTwo === player)
    );
}

function wasMapTie(map: RRMap): boolean {
    return map.winner === WinningPlayer.DRAW;
}
