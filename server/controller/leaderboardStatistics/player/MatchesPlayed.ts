import { Match } from "~~/server/model/Match";
import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMatchesPlayed extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "player" as const];
    };

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.competition",
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
            .getMany();

        const matchesPerPlayer: Record<string, number> = {};
        const competitionsPerPlayer: Record<string, Set<string>> = {};

        for (const match of filterForfeitMatches(matches)) {
            matchesPerPlayer[match.playerOne] ??= 0;
            matchesPerPlayer[match.playerTwo] ??= 0;
            competitionsPerPlayer[match.playerOne] ??= new Set();
            competitionsPerPlayer[match.playerTwo] ??= new Set();

            matchesPerPlayer[match.playerOne] += 1;
            matchesPerPlayer[match.playerTwo] += 1;
            competitionsPerPlayer[match.playerOne].add(match.competition);
            competitionsPerPlayer[match.playerTwo].add(match.competition);
        }

        const result: LeaderboardRow[] = [];

        for (const player of players) {
            result.push({
                columns: {
                    "Player": player.uuid,
                    "Matches played": matchesPerPlayer[player.uuid] ?? 0,
                    "Competitions played": competitionsPerPlayer[player.uuid]?.size ?? 0
                },
                order: 0,
                value: matchesPerPlayer[player.uuid] ?? 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches played",
            category: "player",
            subcategory: "Matches",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Matches played", type: LeaderboardColumnType.TEXT },
                { name: "Competitions played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 1 },
            ]
        }
    };
}
