import { PlayedMap } from "~~/server/model/PlayedMap";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerMapWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Map Winrate";
    hasMaps = false;
    secondaryFilter = "Maps played";
    defaultSecondaryFilter = 10;

    basedOn = ["match" as const, "map" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
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
        const result: LeaderboardPlayerEntry[] = mapsAndWins.mapAll(
            (player, maps) => {
                return {
                    player: player,
                    sortingScore: maps.wins / maps.maps,
                    displayScore: `${((maps.wins / maps.maps) * 100).toFixed(2)}%`,
                    secondaryScore: maps.maps,
                };
            },
        );
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
