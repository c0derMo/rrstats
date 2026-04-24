import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { PlayedMap } from "~~/server/model/PlayedMap";

export class PlayerMapPBTime implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Personal best on map";
    hasMaps = true;
    basedOn = ["match" as const, "map" as const, "player" as const];

    async calculate(): Promise<Record<HitmanMap, LeaderboardPlayerEntry[]>> {
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

        const result: Record<number, LeaderboardPlayerEntry[]> = {};
        for (const map of getAllMaps()) {
            const mapLB: LeaderboardPlayerEntry[] = [];
            for (const player in mapPbs[map]) {
                mapLB.push({
                    player: player,
                    sortingScore: mapPbs[map][player],
                    displayScore: secondsToTime(mapPbs[map][player]),
                });
            }

            mapLB.sort((a, b) => a.sortingScore - b.sortingScore);

            result[map] = mapLB;
        }

        return result;
    }
}
