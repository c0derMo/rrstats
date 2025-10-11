import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate";
    hasMaps = false;
    secondaryFilter = "Matches played";
    defaultSecondaryFilter = 5;

    basedOn = ["match" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
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
        const result: LeaderboardPlayerEntry[] = matchesAndWins.mapAll(
            (player, matches) => {
                return {
                    player: player,
                    sortingScore: matches.wins / matches.matches,
                    displayScore: `${((matches.wins / matches.matches) * 100).toFixed(2)}%`,
                    secondaryScore: matches.matches,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
