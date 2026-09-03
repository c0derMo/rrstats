import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMatchesWon extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "player" as const];
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

        const wtlPerPlayer = new DefaultedMap<
            string,
            { w: number; t: number; l: number }
        >(() => {
            return { w: 0, t: 0, l: 0 };
        });

        for (const match of matches) {
            if (match.playerOneScore > match.playerTwoScore) {
                wtlPerPlayer.get(match.playerOne).w += 1;
                wtlPerPlayer.get(match.playerTwo).l += 1;
            } else if (match.playerTwoScore > match.playerOneScore) {
                wtlPerPlayer.get(match.playerOne).l += 1;
                wtlPerPlayer.get(match.playerTwo).w += 1;
            } else {
                wtlPerPlayer.get(match.playerOne).t += 1;
                wtlPerPlayer.get(match.playerTwo).t += 1;
            }
        }

        const result: LeaderboardRow[] = wtlPerPlayer.mapAll((player, wtl) => {
            const sum = wtl.w + wtl.l + wtl.t;
            return {
                columns: {
                    Player: player,
                    Wins: wtl.w,
                    Ties: wtl.t,
                    Losses: wtl.l,
                    "Matches played": sum,
                },
                order: 0,
                value: wtl.w,
            };
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

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
                    name: "Ties",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Losses",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Matches played",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 1,
                    sortable: true,
                },
            ],
        };
    }
}
