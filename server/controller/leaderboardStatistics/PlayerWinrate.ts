import { LeaderboardPlayerStatistic } from "../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate";
    hasMaps = false;
    secondaryFilter = "Minimum matches played";

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        // Calculating wins and matches
        const matchesAndWins = players.map((player) => {
            return {
                player: player.uuid,
                wins: 0,
                matches: 0,
            };
        });

        for (const match of matches) {
            matchesAndWins.find((m) => m.player === match.playerOne)!.matches +=
                1;
            matchesAndWins.find((m) => m.player === match.playerTwo)!.matches +=
                1;

            if (match.playerOneScore > match.playerTwoScore) {
                matchesAndWins.find(
                    (m) => m.player === match.playerOne,
                )!.wins += 1;
            } else if (match.playerTwoScore > match.playerOneScore) {
                matchesAndWins.find(
                    (m) => m.player === match.playerTwo,
                )!.wins += 1;
            } else if (match.playerOneScore === match.playerTwoScore) {
                matchesAndWins.find(
                    (m) => m.player === match.playerOne,
                )!.wins += 0.5;
                matchesAndWins.find(
                    (m) => m.player === match.playerTwo,
                )!.wins += 0.5;
            }
        }

        // Calculating score from that
        const result: LeaderboardPlayerEntry[] = matchesAndWins
            .filter((player) => player.matches > 0)
            .map((player) => {
                return {
                    player: player.player,
                    sortingScore: player.wins / player.matches,
                    displayScore: `${(
                        (player.wins / player.matches) *
                        100
                    ).toFixed(2)}%`,
                    secondaryScore: player.matches,
                };
            });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
