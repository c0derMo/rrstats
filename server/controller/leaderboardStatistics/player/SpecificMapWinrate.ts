import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { type IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { HitmanMap, getAllMaps } from "~/utils/mapUtils";

export class PlayerSpecificMapWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate on specific map";
    hasMaps = true;
    secondaryFilter = "Spins played";
    defaultSecondaryFilter = 5;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
    ): Record<HitmanMap, LeaderboardPlayerEntry[]> {
        const mapCount: Record<string, Record<HitmanMap, number>> = {};
        const mapWins: Record<string, Record<HitmanMap, number>> = {};

        for (const match of matches) {
            if (mapCount[match.playerOne] == null)
                mapCount[match.playerOne] = this.getDefaultMapRecord(0);
            if (mapCount[match.playerTwo] == null)
                mapCount[match.playerTwo] = this.getDefaultMapRecord(0);
            if (mapWins[match.playerOne] == null)
                mapWins[match.playerOne] = this.getDefaultMapRecord(0);
            if (mapWins[match.playerTwo] == null)
                mapWins[match.playerTwo] = this.getDefaultMapRecord(0);

            for (const map of match.playedMaps) {
                mapCount[match.playerOne][map.map] += 1;
                mapCount[match.playerTwo][map.map] += 1;

                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    mapWins[match.playerOne][map.map] += 1;
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    mapWins[match.playerTwo][map.map] += 1;
                } else {
                    mapWins[match.playerOne][map.map] += 0.5;
                    mapWins[match.playerTwo][map.map] += 0.5;
                }
            }
        }

        const result: Record<HitmanMap, LeaderboardPlayerEntry[]> =
            this.getDefaultMapRecord([]);
        for (const map of getAllMaps()) {
            result[map] = [];
            for (const player in mapCount) {
                if (mapCount[player][map] > 0) {
                    result[map].push({
                        player: player,
                        sortingScore:
                            mapWins[player][map] / mapCount[player][map],
                        displayScore:
                            (
                                (mapWins[player][map] / mapCount[player][map]) *
                                100
                            ).toFixed(2) + "%",
                        secondaryScore: mapCount[player][map],
                    });
                }
            }
            result[map].sort((a, b) => b.sortingScore - a.sortingScore);
        }

        return result;
    }

    private getDefaultMapRecord<T>(value: T): Record<HitmanMap, T> {
        return {
            [HitmanMap.PARIS]: value,
            [HitmanMap.SAPIENZA]: value,
            [HitmanMap.MARRAKESH]: value,
            [HitmanMap.BANGKOK]: value,
            [HitmanMap.COLORADO]: value,
            [HitmanMap.HOKKAIDO]: value,

            [HitmanMap.MIAMI]: value,
            [HitmanMap.SANTA_FORTUNA]: value,
            [HitmanMap.MUMBAI]: value,
            [HitmanMap.WHITTLETON_CREEK]: value,
            [HitmanMap.ISLE_OF_SGAIL]: value,
            [HitmanMap.NEW_YORK]: value,
            [HitmanMap.HAVEN_ISLAND]: value,

            [HitmanMap.DUBAI]: value,
            [HitmanMap.DARTMOOR]: value,
            [HitmanMap.BERLIN]: value,
            [HitmanMap.CHONGQING]: value,
            [HitmanMap.MENDOZA]: value,
            [HitmanMap.AMBROSE_ISLAND]: value,
        };
    }
}
