import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerWinrate extends BaseLeaderboardStatistic {
    type = "player" as const;
    name = "Winrate";
    hasMaps = false;
    secondaryFilter = "Matches played";
    defaultSecondaryFilter = 5;

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

        // Calculating wins and matches
        const matchesAndWins = new DefaultedMap<
            string,
            { wins: number; matches: number }
        >(() => ({ wins: 0, matches: 0 }));

        for (const match of filterForfeitMatches(matches)) {
            const p1 = matchesAndWins.get(match.playerOne);
            const p2 = matchesAndWins.get(match.playerTwo);

            p1.matches += 1;
            p2.matches += 1;

            if (match.playerOneScore > match.playerTwoScore) {
                p1.wins += 1;
            } else if (match.playerTwoScore > match.playerOneScore) {
                p2.wins += 1;
            } else {
                p1.wins += 0.5;
                p2.wins += 0.5;
            }

            matchesAndWins.set(match.playerOne, p1);
            matchesAndWins.set(match.playerTwo, p2);
        }

        // Calculating score from that
        const result: LeaderboardRow[] = matchesAndWins.mapAll(
            (player, matches) => {
                return {
                    columns: {
                        "Player": player,
                        "Score": `${((matches.wins / matches.matches) * 100).toFixed(2)}%`,
                        "Matches played": matches.matches
                    },
                    order: 0,
                    value: matches.wins / matches.matches,
                };
            },
        );
        this.sortAndInferPlacementByValue(result);

        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Winrate",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Score", type: LeaderboardColumnType.TEXT },
                { name: "Matches played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 5 },
            ]
        }
    };
}
