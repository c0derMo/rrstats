import { DefaultedMap } from "~/utils/DefaultedMap";
import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";
import { StreakCounter } from "~/utils/StreakCounter";

export class PlayerMatchesWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Most matches won in a row";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const sortedMatches = [...filterForfeitMatches(matches)].sort(
            (a, b) => a.timestamp - b.timestamp,
        );

        const streakInfo = new DefaultedMap(() => new StreakCounter());

        for (const match of sortedMatches) {
            if (match.playerOneScore > match.playerTwoScore) {
                streakInfo.get(match.playerOne).increaseStreak();
                streakInfo.get(match.playerTwo).resetStreak();
            } else if (match.playerTwoScore > match.playerOneScore) {
                streakInfo.get(match.playerTwo).increaseStreak();
                streakInfo.get(match.playerOne).resetStreak();
            } else {
                streakInfo.get(match.playerOne).resetStreak();
                streakInfo.get(match.playerTwo).resetStreak();
            }
        }

        const result: LeaderboardPlayerEntry[] = streakInfo.mapAll((player, streak) => {
            return {
                player: player,
                sortingScore: streak.getLongestStreak(),
                displayScore: streak.getLongestStreak().toString()
            }
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
