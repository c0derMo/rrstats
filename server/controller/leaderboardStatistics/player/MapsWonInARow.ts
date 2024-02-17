import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerMapsWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Most maps won in a row";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const streakInfo: Record<
            string,
            { currentStreak: number; longestStreak: number }
        > = {};

        for (const match of matches) {
            if (streakInfo[match.playerOne] == null)
                streakInfo[match.playerOne] = {
                    currentStreak: 0,
                    longestStreak: 0,
                };
            if (streakInfo[match.playerTwo] == null)
                streakInfo[match.playerTwo] = {
                    currentStreak: 0,
                    longestStreak: 0,
                };

            for (const map of match.playedMaps) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    streakInfo[match.playerOne].currentStreak += 1;
                    if (
                        streakInfo[match.playerTwo].currentStreak >
                        streakInfo[match.playerTwo].longestStreak
                    ) {
                        streakInfo[match.playerTwo].longestStreak =
                            streakInfo[match.playerTwo].currentStreak;
                    }
                    streakInfo[match.playerTwo].currentStreak = 0;
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    streakInfo[match.playerTwo].currentStreak += 1;
                    if (
                        streakInfo[match.playerOne].currentStreak >
                        streakInfo[match.playerOne].longestStreak
                    ) {
                        streakInfo[match.playerOne].longestStreak =
                            streakInfo[match.playerOne].currentStreak;
                    }
                    streakInfo[match.playerOne].currentStreak = 0;
                }
            }
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in streakInfo) {
            if (
                streakInfo[player].currentStreak >
                streakInfo[player].longestStreak
            ) {
                streakInfo[player].longestStreak =
                    streakInfo[player].currentStreak;
            }

            result.push({
                player: player,
                sortingScore: streakInfo[player].longestStreak,
                displayScore: streakInfo[player].longestStreak.toString(),
            });
        }
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
