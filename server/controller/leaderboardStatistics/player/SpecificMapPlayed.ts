import { Match } from "~~/server/model/Match";
import {
    ServerSideFilteredLeaderboardStatistic,
    type FilterableLeaderboardRows,
} from "../ServerSideFilteredLeaderboardStatistic";

export class PlayerSpecificMapPlayed extends ServerSideFilteredLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    }

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select(["match.playerOne", "match.playerTwo", "map.map"])
            .getMany();
        const mapCount: Record<string, Record<HitmanMap, number>> = {};

        for (const match of matches) {
            mapCount[match.playerOne] ??= this.getDefaultMapRecord(0);
            mapCount[match.playerTwo] ??= this.getDefaultMapRecord(0);

            for (const map of match.playedMaps) {
                mapCount[match.playerOne][map.map] += 1;
                mapCount[match.playerTwo][map.map] += 1;
            }
        }

        const result: Record<HitmanMap, LeaderboardRow[]> =
            this.getDefaultMapRecord([]);
        for (const map of getAllMaps()) {
            result[map] = [];
            for (const player in mapCount) {
                if (mapCount[player][map] > 0) {
                    result[map].push({
                        columns: {
                            Player: player,
                            Played: mapCount[player][map],
                        },
                        order: 0,
                        value: mapCount[player][map],
                    });
                }
            }
            this.sortAndInferPlacementByValue(result[map]);
        }

        const listifiedResult: FilterableLeaderboardRows[] = [];
        for (const map of getAllMaps()) {
            listifiedResult.push({
                filter: { Map: map },
                rows: result[map],
            });
        }

        this.filterableCache = listifiedResult;
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

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Spins played on specific map",
            category: "player",
            subcategory: "Map",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Played", type: LeaderboardColumnType.TEXT },
                {
                    name: "Map",
                    type: LeaderboardColumnType.HIDDEN,
                    filterable: LeaderboardFilterType.MAP,
                    defaultFilter: HitmanMap.PARIS,
                    serverSideFilter: true,
                },
            ],
        };
    }
}
