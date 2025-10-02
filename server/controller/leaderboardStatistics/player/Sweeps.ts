import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerSweeps implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Sweeps";
    hasMaps = false;
    explanatoryText = "Winning a match while the opponent has 0 points.";

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const playerMap: Record<string, number> = {};

        for (const match of matches) {
            if (match.playerOneScore > 2 && match.playerTwoScore === 0) {
                if (playerMap[match.playerOne] == null)
                    playerMap[match.playerOne] = 0;
                playerMap[match.playerOne] += 1;
            } else if (match.playerOneScore === 0 && match.playerTwoScore > 2) {
                if (playerMap[match.playerTwo] == null)
                    playerMap[match.playerTwo] = 0;
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
