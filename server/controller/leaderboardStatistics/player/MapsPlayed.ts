import { PlayedMap } from "~~/server/model/PlayedMap";
import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapsPlayed extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const, "player" as const];
    };

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const matches = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerOne", "playerOne")
            .addSelect("match.playerTwo", "playerTwo")
            .addSelect("match.competition", "competition")
            .addSelect("COUNT(*)", "amountMaps")
            .groupBy("map.matchUuid")
            .addGroupBy("match.playerOne")
            .addGroupBy("match.playerTwo")
            .addGroupBy("match.competition")
            .getRawMany<{
                playerOne: string;
                playerTwo: string;
                competition: string;
                amountMaps: number;
            }>();

        const maps: Record<string, number> = {};
        const competitionsPerPlayer: Record<string, Set<string>> = {};

        for (const match of matches) {
            maps[match.playerOne] ??= 0;
            maps[match.playerTwo] ??= 0;
            competitionsPerPlayer[match.playerOne] ??= new Set();
            competitionsPerPlayer[match.playerTwo] ??= new Set();
            maps[match.playerOne] += match.amountMaps;
            maps[match.playerTwo] += match.amountMaps;
            competitionsPerPlayer[match.playerOne].add(match.competition);
            competitionsPerPlayer[match.playerTwo].add(match.competition);
        }

        const result: LeaderboardRow[] = [];

        for (const player of players) {
            result.push({
                columns: {
                    "Player": player.uuid,
                    "Maps played": maps[player.uuid] ?? 0,
                    "Competitions played": competitionsPerPlayer[player.uuid]?.size ?? 0,
                },
                order: 0,
                value: maps[player.uuid] ?? 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most maps played",
            category: "player",
            subcategory: "Maps",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Maps played", type: LeaderboardColumnType.TEXT },
                { name: "Competitions played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 1 },
            ]
        }
    };
}
