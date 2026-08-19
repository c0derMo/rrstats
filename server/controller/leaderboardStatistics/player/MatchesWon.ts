import { Match } from "~~/server/model/Match";
import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMatchesWon extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "player" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
            .getMany();

        const matchesPerPlayer: Record<string, number> = {};
        const winsPerPlayer: Record<string, number> = {};

        for (const match of matches) {
            matchesPerPlayer[match.playerOne] ??= 0;
            matchesPerPlayer[match.playerTwo] ??= 0;
            winsPerPlayer[match.playerOne] ??= 0;
            winsPerPlayer[match.playerTwo] ??= 0;

            matchesPerPlayer[match.playerOne] += 1;
            matchesPerPlayer[match.playerTwo] += 1;

            if (match.playerOneScore > match.playerTwoScore) {
                winsPerPlayer[match.playerOne] += 1;
            } else if (match.playerTwoScore > match.playerOneScore) {
                winsPerPlayer[match.playerTwo] += 1;
            } else {
                winsPerPlayer[match.playerOne] += 0.5;
                winsPerPlayer[match.playerTwo] += 0.5;
            }
        }

        const result: LeaderboardRow[] = [];

        for (const player of players) {
            result.push({
                columns: {
                    Player: player.uuid,
                    Wins: winsPerPlayer[player.uuid] ?? 0,
                    "Matches played": matchesPerPlayer[player.uuid] ?? 0,
                },
                order: 0,
                value: winsPerPlayer[player.uuid] ?? 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    type = "player" as const;
    name = "Matches won";
    hasMaps = false;

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches won",
            category: "player",
            subcategory: "Matches",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Wins", type: LeaderboardColumnType.TEXT },
                {
                    name: "Matches played",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 1,
                },
            ],
        };
    }
}
