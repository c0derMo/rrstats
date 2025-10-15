import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerSweeps6 implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Sweeps (6+ points)";
    hasMaps = false;
    explanatoryText =
        "Winning with 6 or more points while the opponent has 0 points.";

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
        const playerMap: Record<string, number> = {};

        for (const match of matches) {
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

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in playerMap) {
            result.push({
                player: player,
                sortingScore: playerMap[player],
                displayScore: playerMap[player].toString(),
            });
        }

        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
