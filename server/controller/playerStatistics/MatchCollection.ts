import { IMatch, RRMap, WinningPlayer } from "~/utils/interfaces/IMatch";

type CacheKey = "winrate" | "mapWinrate" | "wtl" | "earliestMatch";

export default class MatchCollection {
    private matches: IMatch[];
    private nonForfeitMatches: IMatch[];
    private cache: Map<CacheKey, unknown>;

    constructor(matches: IMatch[]) {
        this.matches = [...matches].sort((a, b) => a.timestamp - b.timestamp);
        this.nonForfeitMatches = this.matches.filter(wasMatchNotForfeit);
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
            const wtl = this.wtl(player);

            return (wtl.w + 0.5 * wtl.t) / (wtl.w + wtl.t + wtl.l);
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

    wtl(player: string): { w: number; t: number; l: number } {
        return this.getCachedOrCalculate("wtl", () => {
            const wins = this.nonForfeitMatches.filter((m) =>
                hasPlayerWon(player, m),
            ).length;
            const ties = this.nonForfeitMatches.filter(wasMatchTie).length;
            const losses = this.nonForfeitMatches.filter(
                (m) => !hasPlayerWon(player, m) && !wasMatchTie(m),
            ).length;

            return { w: wins, t: ties, l: losses };
        });
    }

    earliestMatch(): IMatch | null {
        return this.getCachedOrCalculate("earliestMatch", () => {
            if (this.matches.length <= 0) return null;

            return this.matches[0];
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
