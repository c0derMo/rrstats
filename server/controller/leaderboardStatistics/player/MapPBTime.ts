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
            .addSelect("match.competition", "competition")
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
                competition: string;
            }>();
        const p2Maps = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerTwo", "player")
            .addSelect("MIN(map.timeTaken)", "time")
            .addSelect("map.map", "map")
            .addSelect("match.competition", "competition")
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
                competition: string;
            }>();

        const mapPbs = new DefaultedMap<
            HitmanMap,
            DefaultedMap<string, { pb: number; competition: string }>
        >(() => {
            return new DefaultedMap(() => {
                return { pb: -1, competition: "" };
            });
        });

        for (const p1 of p1Maps) {
            if (
                !mapPbs.get(p1.map).has(p1.player) ||
                mapPbs.get(p1.map).get(p1.player).pb > p1.time
            ) {
                mapPbs.get(p1.map).get(p1.player).pb = p1.time;
                mapPbs.get(p1.map).get(p1.player).competition = p1.competition;
            }
        }

        for (const p2 of p2Maps) {
            if (
                !mapPbs.get(p2.map).has(p2.player) ||
                mapPbs.get(p2.map).get(p2.player).pb > p2.time
            ) {
                mapPbs.get(p2.map).get(p2.player).pb = p2.time;
                mapPbs.get(p2.map).get(p2.player).competition = p2.competition;
            }
        }

        const result: Record<number, LeaderboardRow[]> = {};
        for (const map of getAllMaps()) {
            const mapLB: LeaderboardRow[] = mapPbs
                .get(map)
                .mapAll((player, stats) => {
                    return {
                        columns: {
                            Player: player,
                            "Personal Best": stats.pb,
                            Competition: stats.competition,
                        },
                        order: 0,
                        value: stats.pb,
                    };
                });

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
            name: "Personal Best (specific map)",
            category: "player",
            subcategory: "Maps",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Personal Best", type: LeaderboardColumnType.TIME },
                { name: "Competition", type: LeaderboardColumnType.TEXT },
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
