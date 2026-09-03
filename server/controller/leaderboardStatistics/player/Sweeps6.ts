import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerSweeps6 extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const];
    }

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
            .getMany();
        const playerMap: Record<string, number> = {};
        const playerMatches: Record<string, number> = {};

        for (const match of matches) {
            if (match.playerOneScore < 6 && match.playerTwoScore < 6) {
                continue;
            }

            playerMatches[match.playerOne] ??= 0;
            playerMatches[match.playerTwo] ??= 0;
            playerMatches[match.playerOne] += 1;
            playerMatches[match.playerTwo] += 1;

            if (match.playerOneScore >= 6 && match.playerTwoScore === 0) {
                playerMap[match.playerOne] ??= 0;
                playerMap[match.playerOne] += 1;
            } else if (
                match.playerOneScore === 0 &&
                match.playerTwoScore >= 6
            ) {
                playerMap[match.playerTwo] ??= 0;
                playerMap[match.playerTwo] += 1;
            }
        }

        const result: LeaderboardRow[] = [];
        for (const player in playerMap) {
            result.push({
                columns: {
                    Player: player,
                    Sweeps: playerMap[player],
                    "Matches played": playerMatches[player],
                    "Sweep rate": playerMap[player] / playerMatches[player],
                },
                value: playerMap[player],
                order: 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches swept (6+ points)",
            category: "player",
            subcategory: "Sweeps",
            explanatoryText:
                "Winning with 6 or more points while the opponent has 0 points.",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Sweeps", type: LeaderboardColumnType.TEXT },
                {
                    name: "Matches played",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 1,
                },
                {
                    name: "Sweep rate",
                    type: LeaderboardColumnType.PERCENTAGE,
                    sortable: true,
                },
            ],
        };
    }
}
