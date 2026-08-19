import { PlayedMap } from "~~/server/model/PlayedMap";
import {
    type FilterableLeaderboardRows,
    ServerSideFilteredLeaderboardStatistic,
} from "../ServerSideFilteredLeaderboardStatistic";

export class PlayerMapPBTime extends ServerSideFilteredLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const, "player" as const];
    }

    async calculate(): Promise<void> {
        const p1Maps = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerOne", "player")
            .addSelect("MIN(map.timeTaken)", "time")
            .addSelect("map.map", "map")
            .where(
                "(map.winner = :winner OR map.winner = :draw) AND map.timeTaken > 0",
                { winner: WinningPlayer.PLAYER_ONE, draw: WinningPlayer.DRAW },
            )
            .groupBy("match.playerOne")
            .addGroupBy("map.map")
            .getRawMany<{
                player: string;
                map: HitmanMap;
                time: number;
            }>();
        const p2Maps = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerTwo", "player")
            .addSelect("MIN(map.timeTaken)", "time")
            .addSelect("map.map", "map")
            .where(
                "(map.winner = :winner OR map.winner = :draw) AND map.timeTaken > 0",
                { winner: WinningPlayer.PLAYER_TWO, draw: WinningPlayer.DRAW },
            )
            .groupBy("match.playerTwo")
            .addGroupBy("map.map")
            .getRawMany<{
                player: string;
                map: HitmanMap;
                time: number;
            }>();

        const mapPbs: Record<number, Record<string, number>> = {};
        for (const p1 of p1Maps) {
            mapPbs[p1.map] ??= {};
            if (mapPbs[p1.map][p1.player] == null) {
                mapPbs[p1.map][p1.player] = p1.time;
            } else {
                mapPbs[p1.map][p1.player] = Math.min(
                    p1.time,
                    mapPbs[p1.map][p1.player],
                );
            }
        }
        for (const p2 of p2Maps) {
            mapPbs[p2.map] ??= {};
            if (mapPbs[p2.map][p2.player] == null) {
                mapPbs[p2.map][p2.player] = p2.time;
            } else {
                mapPbs[p2.map][p2.player] = Math.min(
                    p2.time,
                    mapPbs[p2.map][p2.player],
                );
            }
        }

        const result: Record<number, LeaderboardRow[]> = {};
        for (const map of getAllMaps()) {
            const mapLB: LeaderboardRow[] = [];
            for (const player in mapPbs[map]) {
                mapLB.push({
                    columns: {
                        Player: player,
                        "Personal best": mapPbs[map][player],
                    },
                    order: 0,
                    value: mapPbs[map][player],
                });
            }

            this.sortAndInferPlacementByValue(mapLB, "ASC");
            result[map] = mapLB;
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

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Personal best on map",
            category: "player",
            subcategory: "Map",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Personal best", type: LeaderboardColumnType.TIME },
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
