import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class PlayerMatchesWon implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Matches won";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const amountWins = (
                filterForfeitMatches(matches)
                    .filter((match) => {
                        return (
                            match.playerOne === player.uuid ||
                            match.playerTwo === player.uuid
                        );
                    })
                    .map((match) => {
                        if (match.playerOne === player.uuid) {
                            if (match.playerOneScore > match.playerTwoScore) {
                                return 1;
                            } else if (
                                match.playerOneScore === match.playerTwoScore
                            ) {
                                return 0.5;
                            }
                        } else if (match.playerTwo === player.uuid) {
                            if (match.playerTwoScore > match.playerOneScore) {
                                return 1;
                            } else if (
                                match.playerOneScore === match.playerTwoScore
                            ) {
                                return 0.5;
                            }
                        }
                        return 0;
                    }) as number[]
            ).reduce((prev, cur) => prev + cur, 0);
            return {
                player: player.uuid,
                displayScore: amountWins.toString(),
                sortingScore: amountWins,
            };
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
