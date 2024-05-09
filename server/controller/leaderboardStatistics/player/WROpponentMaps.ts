import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import {
    ChoosingPlayer,
    IMatch,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class PlayerWROpponentMaps implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate on opponent-map-picks";
    hasMaps = false;
    secondaryFilter = "Opponent-map-picks played";

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const playedMaps: Record<string, { played: number; won: number }> = {};

        for (const match of filterForfeitMatches(matches)) {
            for (const map of match.playedMaps) {
                if (map.picked === ChoosingPlayer.RANDOM) continue;

                if (map.picked === ChoosingPlayer.PLAYER_TWO) {
                    if (playedMaps[match.playerOne] == null)
                        playedMaps[match.playerOne] = { played: 0, won: 0 };
                    playedMaps[match.playerOne].played += 1;
                    if (map.winner === WinningPlayer.PLAYER_ONE) {
                        playedMaps[match.playerOne].won += 1;
                    }
                } else if (map.picked === ChoosingPlayer.PLAYER_ONE) {
                    if (playedMaps[match.playerTwo] == null)
                        playedMaps[match.playerTwo] = { played: 0, won: 0 };
                    playedMaps[match.playerTwo].played += 1;
                    if (map.winner === WinningPlayer.PLAYER_TWO) {
                        playedMaps[match.playerTwo].won += 1;
                    }
                }
            }
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in playedMaps) {
            result.push({
                player: player,
                displayScore:
                    (
                        (playedMaps[player].won / playedMaps[player].played) *
                        100
                    ).toFixed(2) + "%",
                sortingScore:
                    playedMaps[player].won / playedMaps[player].played,
                secondaryScore: playedMaps[player].played,
            });
        }
        result.sort((a, b) => b.sortingScore - a.sortingScore);
        return result;
    }
}
