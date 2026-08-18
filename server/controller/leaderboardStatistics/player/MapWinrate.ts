import { PlayedMap } from "~~/server/model/PlayedMap";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerMapWinrate extends BaseLeaderboardStatistic {
    basedOn() {
        return ["match" as const, "map" as const];
    };

    async calculate(): Promise<void> {
        const maps = await PlayedMap.createQueryBuilder("map")
            .innerJoin("map.match", "match")
            .select([
                "map.map",
                "map.winner",
                "match.playerOne",
                "match.playerTwo",
            ])
            .getMany();

        // Calculating wins and matches
        const mapsAndWins = new DefaultedMap<
            string,
            { wins: number; maps: number }
        >(() => ({ wins: 0, maps: 0 }));

        for (const map of maps) {
            const p1 = mapsAndWins.get(map.match.playerOne);
            const p2 = mapsAndWins.get(map.match.playerTwo);

            p1.maps += 1;
            p2.maps += 1;

            switch (map.winner) {
                case WinningPlayer.PLAYER_ONE:
                    p1.wins += 1;
                    break;
                case WinningPlayer.PLAYER_TWO:
                    p2.wins += 1;
                    break;
                case WinningPlayer.DRAW:
                    p1.wins += 0.5;
                    p2.wins += 0.5;
                    break;
            }

            mapsAndWins.set(map.match.playerOne, p1);
            mapsAndWins.set(map.match.playerTwo, p2);
        }

        // Calculating score from that
        const result: LeaderboardRow[] = mapsAndWins.mapAll(
            (player, maps) => {
                return {
                    columns: {
                        "Player": player,
                        "Winrate": maps.wins / maps.maps,
                        "Maps played": maps.maps,
                    },
                    value: maps.wins / maps.maps,
                    order: 0,
                };
            },
        );
        this.sortAndInferPlacementByValue(result);

        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Map Winrate",
            category: "player",
            subcategory: "Maps",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Winrate", type: LeaderboardColumnType.PERCENTAGE },
                { name: "Maps played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 10 },
            ]
        }
    };
}
