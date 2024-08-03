import { DefaultedMap } from "~/utils/DefaultedMap";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { type IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { StreakCounter } from "~/utils/StreakCounter";

export class PlayerMapsWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Most maps won in a row";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const streakInfo = new DefaultedMap<string, StreakCounter>(
            () => new StreakCounter(),
        );

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    streakInfo.get(match.playerOne).increaseStreak();
                    streakInfo.get(match.playerTwo).resetStreak();
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    streakInfo.get(match.playerTwo).increaseStreak();
                    streakInfo.get(match.playerOne).resetStreak();
                } else if (map.winner === WinningPlayer.DRAW) {
                    streakInfo.get(match.playerOne).resetStreak();
                    streakInfo.get(match.playerTwo).resetStreak();
                }
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
