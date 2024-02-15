import { LeaderboardPlayerStatistic } from "../LeaderboardController";
import { IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerMapWinrate implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Map Winrate";
    hasMaps = false;
    secondaryFilter = "Minimum maps played";

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        // Calculating wins and matches
        const mapsAndWins = players.map((player) => {
            return {
                player: player.uuid,
                wins: 0,
                maps: 0,
            };
        });

        for (const match of matches) {
            mapsAndWins.find((m) => m.player === match.playerOne)!.maps +=
                match.playedMaps.length;
            mapsAndWins.find((m) => m.player === match.playerTwo)!.maps +=
                match.playedMaps.length;

            for (const map of match.playedMaps) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    mapsAndWins.find(
                        (m) => m.player === match.playerOne,
                    )!.wins += 1;
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    mapsAndWins.find(
                        (m) => m.player === match.playerTwo,
                    )!.wins += 1;
                } else if (map.winner === WinningPlayer.DRAW) {
                    mapsAndWins.find(
                        (m) => m.player === match.playerOne,
                    )!.wins += 0.5;
                    mapsAndWins.find(
                        (m) => m.player === match.playerTwo,
                    )!.wins += 0.5;
                }
            }
        }

        // Calculating score from that
        const result: LeaderboardPlayerEntry[] = mapsAndWins
            .filter((player) => player.maps > 0)
            .map((player) => {
                return {
                    player: player.player,
                    sortingScore: player.wins / player.maps,
                    displayScore: `${(
                        (player.wins / player.maps) *
                        100
                    ).toFixed(2)}%`,
                    secondaryScore: player.maps,
                };
            });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
