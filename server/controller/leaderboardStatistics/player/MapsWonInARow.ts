import { Match } from "~~/server/model/Match";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerMapsWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Most maps won in a row";
    hasMaps = false;

    basedOn = ["match" as const, "map" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select(["match.playerOne", "match.playerTwo", "map.winner"])
            .orderBy("match.timestamp", "ASC")
            .getMany();
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
