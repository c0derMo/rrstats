import { PlayedMap } from "~~/server/model/PlayedMap";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { Player } from "~~/server/model/Player";

export class PlayerMapsPlayed implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Maps played";
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
            .addSelect("COUNT(*)", "amountMaps")
            .groupBy("map.matchUuid")
            .addGroupBy("match.playerOne")
            .addGroupBy("match.playerTwo")
            .getRawMany<{
                playerOne: string;
                playerTwo: string;
                amountMaps: number;
            }>();

        const maps: Record<string, number> = {};

        for (const match of matches) {
            maps[match.playerOne] ??= 0;
            maps[match.playerTwo] ??= 0;
            maps[match.playerOne] += match.amountMaps;
            maps[match.playerTwo] += match.amountMaps;
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
