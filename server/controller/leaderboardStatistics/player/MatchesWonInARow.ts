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
                "match.timestamp",
            ])
            .orderBy("match.timestamp", "ASC")
            .getMany();
        const streakInfo = new DefaultedMap<string, StreakCounter<number>>(
            () => new StreakCounter(),
        );

        for (const match of filterForfeitMatches(matches)) {
            if (match.playerOneScore > match.playerTwoScore) {
                streakInfo.get(match.playerOne).increaseStreak(match.timestamp);
                streakInfo.get(match.playerTwo).resetStreak();
            } else if (match.playerTwoScore > match.playerOneScore) {
                streakInfo.get(match.playerTwo).increaseStreak(match.timestamp);
                streakInfo.get(match.playerOne).resetStreak();
            } else {
                streakInfo.get(match.playerOne).resetStreak();
                streakInfo.get(match.playerTwo).resetStreak();
            }
        }

        const result: LeaderboardRow[] = [];

        streakInfo.forEach((player, counter) => {
            for (const streak of counter.getFinishedStreaks()) {
                if (streak.length >= 5) {
                    result.push({
                        columns: {
                            Player: player,
                            "Winning streak": streak.length,
                            Active: false,
                            "Last match": streak.value,
                        },
                        order: 0,
                        value: streak.length,
                    });
                }
            }

            if (counter.getActiveStreak().length >= 5) {
                result.push({
                    columns: {
                        Player: player,
                        "Winning streak": counter.getActiveStreak().length,
                        Active: true,
                        "Last match": counter.getActiveStreak().value,
                    },
                    order: 0,
                    value: counter.getActiveStreak().length,
                });
            }
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Longest winning streak",
            category: "player",
            subcategory: "Streaks",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Winning streak", type: LeaderboardColumnType.TEXT },
                {
                    name: "Active",
                    type: LeaderboardColumnType.BOOLEAN,
                    filterable: LeaderboardFilterType.BOOLEAN,
                    defaultFilter: false,
                },
                {
                    name: "Last match",
                    type: LeaderboardColumnType.DATE,
                    sortable: true,
                },
            ],
        };
    }
}
