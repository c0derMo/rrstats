import { Player } from "~~/server/model/Player";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { PlayedMap } from "~~/server/model/PlayedMap";

export class PlayerMapsWon implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Maps won";
    hasMaps = false;

    basedOn = ["match" as const, "map" as const, "player" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const matches = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerOne", "playerOne")
            .addSelect("match.playerTwo", "playerTwo")
            .addSelect(
                "COUNT(CASE WHEN map.winner = 0 THEN 1 END)",
                "drawnMaps",
            )
            .addSelect("COUNT(CASE WHEN map.winner = 1 THEN 1 END)", "p1Win")
            .addSelect("COUNT(CASE WHEN map.winner = 2 THEN 1 END)", "p2Win")
            .groupBy("map.matchUuid")
            .getRawMany<{
                playerOne: string;
                playerTwo: string;
                drawnMaps: number;
                p1Win: number;
                p2Win: number;
            }>();

        const maps: Record<string, number> = {};

        for (const match of matches) {
            maps[match.playerOne] ??= 0;
            maps[match.playerTwo] ??= 0;
            maps[match.playerOne] += match.p1Win + 0.5 * match.drawnMaps;
            maps[match.playerTwo] += match.p2Win + 0.5 * match.drawnMaps;
        }

        const result: LeaderboardPlayerEntry[] = [];

        for (const player of players) {
            result.push({
                player: player.uuid,
                displayScore: maps[player.uuid]?.toString() ?? "0",
                sortingScore: maps[player.uuid] ?? 0,
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
