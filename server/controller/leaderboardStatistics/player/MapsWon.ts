import { PlayedMap } from "~~/server/model/PlayedMap";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapsWon extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const, "player" as const];
    }

    async calculate(): Promise<void> {
        const matches = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select("match.playerOne", "playerOne")
            .addSelect("match.playerTwo", "playerTwo")
            .addSelect(
                "COUNT(CASE WHEN map.winner = 0 THEN 1 END)",
                "drawnMaps",
            )
            .addSelect("COUNT(CASE WHEN map.winner = 1 THEN 1 END)", "p1Win")
            .addSelect("COUNT(CASE WHEN map.winner = 2 THEN 1 END)", "p2Win")
            .groupBy("map.matchUuid")
            .addGroupBy("match.playerOne")
            .addGroupBy("match.playerTwo")
            .getRawMany<{
                playerOne: string;
                playerTwo: string;
                drawnMaps: number;
                p1Win: number;
                p2Win: number;
            }>();

        const wtlPerPlayer = new DefaultedMap<
            string,
            { w: number; t: number; l: number }
        >(() => {
            return { w: 0, t: 0, l: 0 };
        });

        for (const match of matches) {
            wtlPerPlayer.get(match.playerOne).w += match.p1Win;
            wtlPerPlayer.get(match.playerOne).t += match.drawnMaps;
            wtlPerPlayer.get(match.playerOne).l += match.p2Win;

            wtlPerPlayer.get(match.playerTwo).w += match.p2Win;
            wtlPerPlayer.get(match.playerTwo).t += match.drawnMaps;
            wtlPerPlayer.get(match.playerTwo).l += match.p1Win;
        }

        const result: LeaderboardRow[] = wtlPerPlayer.mapAll((player, wtl) => {
            const sum = wtl.w + wtl.t + wtl.l;
            return {
                columns: {
                    Player: player,
                    Wins: wtl.w,
                    Ties: wtl.t,
                    Losses: wtl.l,
                    "Maps played": sum,
                },
                order: 0,
                value: wtl.w,
            };
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most maps won",
            category: "player",
            subcategory: "Maps",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Wins", type: LeaderboardColumnType.TEXT },
                {
                    name: "Ties",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Losses",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Maps played",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 1,
                    sortable: true,
                },
            ],
        };
    }
}
