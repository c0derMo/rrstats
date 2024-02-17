import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import {
    ChoosingPlayer,
    IMatch,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerWROpponentMaps implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Winrate on opponent-map-picks";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const playersMatches = matches.filter((match) => {
                return (
                    match.playerOne === player.uuid ||
                    match.playerTwo === player.uuid
                );
            });

            let mapsPlayed = 0;
            let mapsWon = 0;
            for (const match of playersMatches) {
                const wplayerInMatch =
                    match.playerOne === player.uuid
                        ? WinningPlayer.PLAYER_ONE
                        : WinningPlayer.PLAYER_TWO;
                const pplayerInMatch =
                    match.playerOne === player.uuid
                        ? ChoosingPlayer.PLAYER_TWO
                        : ChoosingPlayer.PLAYER_ONE;
                for (const map of match.playedMaps) {
                    if (map.picked !== pplayerInMatch) continue;
                    mapsPlayed += 1;
                    if (map.winner === wplayerInMatch) {
                        mapsWon += 1;
                    } else if (map.winner === WinningPlayer.DRAW) {
                        mapsWon += 0.5;
                    }
                }
            }

            return {
                player: player.uuid,
                displayScore: ((mapsWon / mapsPlayed) * 100).toFixed(2) + "%",
                sortingScore: mapsWon / mapsPlayed,
            };
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
