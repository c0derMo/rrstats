import { DefaultedMap } from "~/utils/DefaultedMap";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";
import { StreakCounter } from "~/utils/StreakCounter";

export class PlayerMatchesWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Most matches won in a row";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const streakInfo = new DefaultedMap<string, StreakCounter>(
            () => new StreakCounter(),
        );

        for (const match of filterForfeitMatches(matches)) {
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

        const result: LeaderboardPlayerEntry[] = streakInfo
            .mapAll((player, streak) => {
                return {
                    player: player,
                    sortingScore: streak.getLongestStreak(),
                    displayScore: streak.getLongestStreak().toString(),
                };
            })
            .filter((s) => s.sortingScore > 1);
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
