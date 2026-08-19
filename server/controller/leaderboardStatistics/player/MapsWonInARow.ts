import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapsWonInARow extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    }

    async calculate(): Promise<void> {
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

        const result: LeaderboardRow[] = [];
        streakInfo.forEach((player, streakCounter) => {
            for (const streak of streakCounter.getAllStreaks()) {
                if (streak >= 5) {
                    result.push({
                        columns: {
                            "Player": player,
                            "Streak": streak
                        },
                        value: streak,
                        order: 0,
                    })
                }
            }
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most maps won in a row",
            category: "player",
            subcategory: "Streaks",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Streak", type: LeaderboardColumnType.TEXT },
            ]
        }
    };
}
