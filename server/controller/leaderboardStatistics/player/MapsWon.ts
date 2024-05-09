import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch, WinningPlayer } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class PlayerMapsWon implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Maps won";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const amountWins = filterForfeitMatches(matches)
                .filter((match) => {
                    return (
                        match.playerOne === player.uuid ||
                        match.playerTwo === player.uuid
                    );
                })
                .map((match) => {
                    if (match.playerOne === player.uuid) {
                        return (
                            match.playedMaps.filter(
                                (map) =>
                                    map.winner === WinningPlayer.PLAYER_ONE,
                            ).length +
                            match.playedMaps.filter(
                                (map) => map.winner === WinningPlayer.DRAW,
                            ).length /
                                2
                        );
                    } else if (match.playerTwo === player.uuid) {
                        return (
                            match.playedMaps.filter(
                                (map) =>
                                    map.winner === WinningPlayer.PLAYER_TWO,
                            ).length +
                            match.playedMaps.filter(
                                (map) => map.winner === WinningPlayer.DRAW,
                            ).length /
                                2
                        );
                    }
                    return 0;
                })
                .reduce((prev, cur) => prev + cur, 0);
            return {
                player: player.uuid,
                displayScore: amountWins.toString(),
                sortingScore: amountWins,
            };
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
