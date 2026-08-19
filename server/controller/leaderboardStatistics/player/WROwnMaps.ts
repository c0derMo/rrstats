import { Match } from "~~/server/model/Match";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerWROwnMaps extends BaseLeaderboardStatistic {
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

        const playedMaps: Record<string, { played: number; won: number }> = {};

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.picked === ChoosingPlayer.RANDOM) continue;

                if (map.picked === ChoosingPlayer.PLAYER_ONE) {
                    playedMaps[match.playerOne] ??= { played: 0, won: 0 };
                    playedMaps[match.playerOne].played += 1;
                    if (map.winner === WinningPlayer.PLAYER_ONE) {
                        playedMaps[match.playerOne].won += 1;
                    }
                } else if (map.picked === ChoosingPlayer.PLAYER_TWO) {
                    playedMaps[match.playerTwo] ??= { played: 0, won: 0 };
                    playedMaps[match.playerTwo].played += 1;
                    if (map.winner === WinningPlayer.PLAYER_TWO) {
                        playedMaps[match.playerTwo].won += 1;
                    }
                }
            }
        }

        const result: LeaderboardRow[] = [];
        for (const player in playedMaps) {
            result.push({
                columns: {
                    "Player": player,
                    "Winrate": playedMaps[player].won / playedMaps[player].played,
                    "Own map picks played": playedMaps[player].played,
                },
                order: 0,
                value: playedMaps[player].won / playedMaps[player].played,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Winrate on own-map-picks",
            category: "player",
            subcategory: "Maps",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Winrate", type: LeaderboardColumnType.PERCENTAGE },
                { name: "Own map picks played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 5 },
            ]
        }
    };
}
