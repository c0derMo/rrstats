import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerSameMapWonInARow extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    };

    async calculate(): Promise<void> {
        const matches = await Match.createQueryBuilder("match")
            .innerJoin("match.playedMaps", "map")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "map.map",
                "map.winner",
                "map.forfeit",
            ])
            .orderBy("match.timestamp", "ASC")
            .getMany();
        const streaks = new DefaultedMap<
            string,
            DefaultedMap<number, StreakCounter>
        >(() => new DefaultedMap(() => new StreakCounter()));

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.forfeit) continue;

                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    streaks.get(match.playerOne).get(map.map).increaseStreak();
                    streaks.get(match.playerTwo).get(map.map).resetStreak();
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    streaks.get(match.playerTwo).get(map.map).increaseStreak();
                    streaks.get(match.playerOne).get(map.map).resetStreak();
                } else if (map.winner === WinningPlayer.DRAW) {
                    streaks.get(match.playerTwo).get(map.map).resetStreak();
                    streaks.get(match.playerOne).get(map.map).resetStreak();
                }
            }
        }

        const result: LeaderboardRow[] = [];

        streaks.mapAll((player, playerStreaks) => {
            playerStreaks.mapAll((map, streak) => {
                for (const singleStreak of streak.getAllStreaks()) {
                    if (singleStreak >= 5) {
                        result.push({
                            columns: {
                                "Player": player,
                                "Streak": singleStreak,
                                "Map": map
                            },
                            order: 0,
                            value: singleStreak,
                        });
                    }
                    // if (streak.getLongestStreak() > 1) {
                    //     result.push({
                    //         columns: {
                    //             "Player": player,
                    //             "Streak": streak.getLongestStreak(),
                    //             "Map": map
                    //         },
                    //         order: 0,
                    //         value: streak.getLongestStreak(),
                    //     });
                    // }
                }
            });
        });
        this.sortAndInferPlacementByValue(result);

        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Winning streak on a map",
            category: "player",
            subcategory: "Streaks",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Streak", type: LeaderboardColumnType.TEXT },
                { name: "Map", type: LeaderboardColumnType.MAP, filterable: LeaderboardFilterType.MAP_OPTIONAL, defaultFilter: OptionalMap.NO_MAP },
            ]
        }
    };
}
