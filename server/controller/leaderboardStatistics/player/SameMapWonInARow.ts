import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { type IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { StreakCounter } from "~/utils/StreakCounter";
import {
    type HitmanMap,
    type OptionalMap,
    getAllMaps,
    getMap,
} from "~/utils/mapUtils";

export class PlayerSameMapWonInARow implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winning streak on a map";
    hasMaps = true;
    mapOptional = true;

    calculate(
        players: IPlayer[],
        matches: IMatch[],
    ): Record<HitmanMap | OptionalMap, LeaderboardPlayerEntry[]> {
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

        const result = {} as Record<
            HitmanMap | OptionalMap,
            LeaderboardPlayerEntry[]
        >;
        for (const map of getAllMaps()) {
            result[map] = [];
        }
        result[-1] = [];

        streaks.mapAll((player, playerStreaks) => {
            playerStreaks.mapAll((map, streak) => {
                if (streak.getLongestStreak() > 1) {
                    result[-1].push({
                        player: player,
                        displayScore: `${streak
                            .getLongestStreak()
                            .toString()} (${getMap(map)!.abbreviation})`,
                        sortingScore: streak.getLongestStreak(),
                    });
                    result[map as HitmanMap].push({
                        player: player,
                        displayScore: streak.getLongestStreak().toString(),
                        sortingScore: streak.getLongestStreak(),
                    });
                }
            });
        });

        for (const map of getAllMaps()) {
            result[map].sort((a, b) => b.sortingScore - a.sortingScore);
        }
        result[-1].sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
