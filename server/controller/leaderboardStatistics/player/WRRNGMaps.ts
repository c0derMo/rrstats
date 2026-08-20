import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerWRRNGMaps extends BaseLeaderboardStatistic {
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
                "map.picked",
            ])
            .getMany();

        const playedMaps = new DefaultedMap<
            string,
            { played: number; won: number }
        >(() => {
            return { played: 0, won: 0 };
        });

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.picked !== ChoosingPlayer.RANDOM) continue;

                playedMaps.get(match.playerOne).played += 1;
                playedMaps.get(match.playerTwo).played += 1;

                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    playedMaps.get(match.playerOne).won += 1;
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    playedMaps.get(match.playerOne).won += 1;
                }
            }
        }

        const result: LeaderboardRow[] = playedMaps.mapAll((player, stats) => {
            return {
                columns: {
                    Player: player,
                    Winrate: stats.won / stats.played,
                    "Random picked maps": stats.played,
                },
                order: 0,
                value: stats.won / stats.played,
            };
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Highest map winrate (random picks)",
            category: "player",
            subcategory: "Maps",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Winrate", type: LeaderboardColumnType.PERCENTAGE },
                {
                    name: "Random picked maps",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 10,
                },
            ],
        };
    }
}
