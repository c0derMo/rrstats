import { Player } from "~~/server/model/Player";
import { PlayedMap } from "~~/server/model/PlayedMap";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapsWon extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const, "player" as const];
    }

    async calculate(): Promise<void> {
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
            .addGroupBy("match.playerOne")
            .addGroupBy("match.playerTwo")
            .getRawMany<{
                playerOne: string;
                playerTwo: string;
                drawnMaps: number;
                p1Win: number;
                p2Win: number;
            }>();

        const maps: Record<string, number> = {};
        const wins: Record<string, number> = {};

        for (const match of matches) {
            maps[match.playerOne] ??= 0;
            maps[match.playerTwo] ??= 0;
            wins[match.playerOne] ??= 0;
            wins[match.playerTwo] ??= 0;
            maps[match.playerOne] += 1;
            maps[match.playerTwo] += 1;
            wins[match.playerOne] += match.p1Win + 0.5 * match.drawnMaps;
            wins[match.playerTwo] += match.p2Win + 0.5 * match.drawnMaps;
        }

        const result: LeaderboardRow[] = [];

        for (const player of players) {
            result.push({
                columns: {
                    "Player": player.uuid,
                    "Wins": wins[player.uuid] ?? 0,
                    "Maps played": maps[player.uuid] ?? 0
                },
                order: 0,
                value: wins[player.uuid] ?? 0,
            });
        }
        
        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most maps won",
            category: "player",
            subcategory: "Maps",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Wins", type: LeaderboardColumnType.TEXT },
                { name: "Maps played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 1 },
            ]
        }
    };
}
