import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerSpecificMapWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate on specific map";
    hasMaps = true;
    secondaryFilter = "Spins played";
    defaultSecondaryFilter = 5;

    basedOn = ["match" as const, "map" as const];

    async calculate(): Promise<Record<HitmanMap, LeaderboardPlayerEntry[]>> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "map.map",
                "map.winner",
            ])
            .getMany();
        const mapCount: Record<string, Record<HitmanMap, number>> = {};
        const mapWins: Record<string, Record<HitmanMap, number>> = {};

        for (const match of matches) {
            mapCount[match.playerOne] ??= this.getDefaultMapRecord(0);
            mapCount[match.playerTwo] ??= this.getDefaultMapRecord(0);
            mapWins[match.playerOne] ??= this.getDefaultMapRecord(0);
            mapWins[match.playerTwo] ??= this.getDefaultMapRecord(0);

            for (const map of match.playedMaps) {
                mapCount[match.playerOne][map.map] += 1;
                mapCount[match.playerTwo][map.map] += 1;
                switch (map.winner) {
                    case WinningPlayer.PLAYER_ONE:
                        mapWins[match.playerOne][map.map] += 1;
                        break;
                    case WinningPlayer.PLAYER_TWO:
                        mapWins[match.playerTwo][map.map] += 1;
                        break;
                    case WinningPlayer.DRAW:
                        mapWins[match.playerOne][map.map] += 0.5;
                        mapWins[match.playerTwo][map.map] += 0.5;
                        break;
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
