import {
    ChoosingPlayer,
    type IMatch,
    type RRBannedMap,
    type RRMap,
    WinningPlayer,
} from "../../types/IMatch";
import { getAllMaps } from "../mapUtils";

type CacheKey =
    | "winrate"
    | "mapWinrate"
    | "wtl"
    | "earliestMatch"
    | "amountMaps"
    | "amountMatches"
    | "mapPickAmount"
    | "maps"
    | "selfPickedMaps"
    | "selfBannedMaps"
    | "opponentPickedMaps"
    | "opponentBannedMaps"
    | "mapPlayed"
    | "mapWon"
    | "perMapWinrate"
    | "mapPBs";

export default class MatchCollection {
    private matches: IMatch[];
    private player: string;
    private nonForfeitMatches: IMatch[];
    private cache: Map<CacheKey, unknown>;

    constructor(matches: IMatch[], player: string) {
        this.matches = [...matches].sort((a, b) => a.timestamp - b.timestamp);
        this.player = player;
        this.nonForfeitMatches = this.matches.filter(wasMatchNotForfeit);
        this.cache = new Map();
    }

    private getCachedOrCalculate<T>(key: CacheKey, calculator: () => T): T {
        if (!this.cache.has(key)) {
            this.cache.set(key, calculator());
        }
        return this.cache.get(key) as T;
    }

    winrate(): number {
        return this.getCachedOrCalculate("winrate", () => {
            const wtl = this.wtl();

            return (wtl.w + 0.5 * wtl.t) / (wtl.w + wtl.t + wtl.l);
        });
    }

    mapWinrate(): number {
        return this.getCachedOrCalculate("mapWinrate", () => {
            const wins = this.matches
                .map((match) => {
                    return match.playedMaps
                        .filter(wasMapNotForfeit)
                        .filter((map) => wasMapWonBy(this.player, match, map))
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

    wtl(): { w: number; t: number; l: number } {
        return this.getCachedOrCalculate("wtl", () => {
            const wins = this.nonForfeitMatches.filter((m) =>
                hasPlayerWon(this.player, m),
            ).length;
            const ties = this.nonForfeitMatches.filter(wasMatchTie).length;
            const losses = this.nonForfeitMatches.filter(
                (m) => !hasPlayerWon(this.player, m) && !wasMatchTie(m),
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

    amountMatches(): number {
        return this.getCachedOrCalculate("amountMatches", () => {
            return this.matches.filter(wasMatchNotForfeit).length;
        });
    }

    allMaps(): RRMap[] {
        return this.getCachedOrCalculate("maps", () => {
            return this.matches
                .map((match) => match.playedMaps)
                .reduce((prev, cur) => [...prev, ...cur], []);
        });
    }

    selfPickedMaps(): RRMap[] {
        return this.getCachedOrCalculate("selfPickedMaps", () => {
            return this.matches
                .map((match) => {
                    return match.playedMaps.filter((map) =>
                        wasMapPickedBy(this.player, match, map),
                    );
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
        });
    }

    amountMaps(): number {
        return this.getCachedOrCalculate("amountMaps", () => {
            return this.allMaps().filter(wasMapNotForfeit).length;
        });
    }

    mapPickAmount(): number[] {
        return this.getCachedOrCalculate("mapPickAmount", () => {
            const mapPickAmounts = getAllMaps().map(() => 0);
            for (const map of this.selfPickedMaps()) {
                mapPickAmounts[map.map] += 1;
            }
            return mapPickAmounts;
        });
    }

    mapPickedAgainstAmount(): number[] {
        return this.getCachedOrCalculate("opponentPickedMaps", () => {
            const pickedAgainstAmounts = getAllMaps().map(() => 0);
            const oppoPicks = this.matches
                .map((match) => {
                    const opponent =
                        this.player === match.playerOne
                            ? match.playerTwo
                            : match.playerOne;
                    return match.playedMaps.filter((map) =>
                        wasMapPickedBy(opponent, match, map),
                    );
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
            for (const pick of oppoPicks) {
                pickedAgainstAmounts[pick.map] += 1;
            }
            return pickedAgainstAmounts;
        });
    }

    mapBanAmount(): number[] {
        return this.getCachedOrCalculate("selfBannedMaps", () => {
            const mapBanAmounts = getAllMaps().map(() => 0);
            const ownBans = this.matches
                .map((match) => {
                    return match.bannedMaps.filter((ban) =>
                        wasMapPickedBy(this.player, match, ban),
                    );
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
            for (const ban of ownBans) {
                mapBanAmounts[ban.map] += 1;
            }
            return mapBanAmounts;
        });
    }

    mapBannedAgainstAmount(): number[] {
        return this.getCachedOrCalculate("opponentBannedMaps", () => {
            const bannedAgainstAmounts = getAllMaps().map(() => 0);
            const oppoBans = this.matches
                .map((match) => {
                    const opponent =
                        this.player === match.playerOne
                            ? match.playerTwo
                            : match.playerOne;
                    return match.bannedMaps.filter((map) =>
                        wasMapPickedBy(opponent, match, map),
                    );
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
            for (const ban of oppoBans) {
                bannedAgainstAmounts[ban.map] += 1;
            }
            return bannedAgainstAmounts;
        });
    }

    mapPlayAmount(): number[] {
        return this.getCachedOrCalculate("mapPlayed", () => {
            const mapPlayedAmounts = getAllMaps().map(() => 0);
            const plays = this.allMaps().filter(wasMapNotForfeit);
            for (const map of plays) {
                mapPlayedAmounts[map.map] += 1;
            }
            return mapPlayedAmounts;
        });
    }

    mapWinAmount(): number[] {
        return this.getCachedOrCalculate("mapWon", () => {
            const mapWonAmounts = getAllMaps().map(() => 0);
            const wins = this.matches
                .map((match) => {
                    return match.playedMaps
                        .filter((map) => wasMapWonBy(this.player, match, map))
                        .filter(wasMapNotForfeit);
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
            const ties = this.matches
                .map((match) => {
                    return match.playedMaps
                        .filter(wasMapTie)
                        .filter(wasMapNotForfeit);
                })
                .reduce((prev, cur) => [...prev, ...cur], []);
            for (const map of wins) {
                mapWonAmounts[map.map] += 1;
            }
            for (const map of ties) {
                mapWonAmounts[map.map] += 0.5;
            }
            return mapWonAmounts;
        });
    }

    perMapWinrate(): number[] {
        return this.getCachedOrCalculate("perMapWinrate", () => {
            const mapWinrate = getAllMaps().map(() => 0);
            const wins = this.mapWinAmount();
            const plays = this.mapPlayAmount();
            for (const map of getAllMaps()) {
                mapWinrate[map] = wins[map] / plays[map];
            }

            return mapWinrate;
        });
    }

    mapPBs(): { match: IMatch | null; map: number }[] {
        return this.getCachedOrCalculate("mapPBs", () => {
            const pbs = getAllMaps().map(() => {
                return { match: null as IMatch | null, map: -1 };
            });

            for (const match of this.matches) {
                for (const mapIdx in match.playedMaps) {
                    const map = match.playedMaps[mapIdx];
                    if (
                        !wasMapNotForfeit(map) ||
                        !hasMapTimeGreaterZero(map) ||
                        !wasMapWonBy(this.player, match, map)
                    ) {
                        continue;
                    }

                    const previousBestMapIndex = pbs[map.map].map;
                    const previousBest =
                        pbs[map.map].match?.playedMaps[previousBestMapIndex]
                            .timeTaken ?? -1;
                    if (map.timeTaken < previousBest || previousBest < 0) {
                        pbs[map.map] = {
                            match: match,
                            map: parseInt(mapIdx),
                        };
                    }
                }
            }

            return pbs;
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

function wasMapPickedBy(
    player: string,
    match: IMatch,
    map: RRMap | RRBannedMap,
): boolean {
    return (
        (map.picked === ChoosingPlayer.PLAYER_ONE &&
            match.playerOne === player) ||
        (map.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === player)
    );
}

function hasMapTimeGreaterZero(map: RRMap): boolean {
    return map.timeTaken > 0;
}
