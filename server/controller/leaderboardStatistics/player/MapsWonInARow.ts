import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapsWonInARow extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    }

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "map.winner",
                "match.timestamp",
            ])
            .orderBy("match.timestamp", "ASC")
            .getMany();
        const streakInfo = new DefaultedMap<string, StreakCounter<number>>(
            () => new StreakCounter(),
        );

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    streakInfo
                        .get(match.playerOne)
                        .increaseStreak(match.timestamp);
                    streakInfo.get(match.playerTwo).resetStreak();
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    streakInfo
                        .get(match.playerTwo)
                        .increaseStreak(match.timestamp);
                    streakInfo.get(match.playerOne).resetStreak();
                } else if (map.winner === WinningPlayer.DRAW) {
                    streakInfo.get(match.playerOne).resetStreak();
                    streakInfo.get(match.playerTwo).resetStreak();
                }
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
            name: "Longest map winning streak",
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
