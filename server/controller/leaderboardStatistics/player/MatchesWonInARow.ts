import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMatchesWonInARow extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const];
    }

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
            ])
            .orderBy("match.timestamp", "ASC")
            .getMany();
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

        const result: LeaderboardRow[] = [];

        streakInfo.forEach((player, counter) => {
            for (const streak of counter.getAllStreaks()) {
                if (streak >= 5) {
                    result.push({
                        columns: {
                            Player: player,
                            "Winning streak": streak,
                        },
                        order: 0,
                        value: streak,
                    });
                }
            }
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most matches won in a row",
            category: "player",
            subcategory: "Streaks",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Winning streak", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
