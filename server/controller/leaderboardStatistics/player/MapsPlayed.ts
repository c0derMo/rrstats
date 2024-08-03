import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerMapsPlayed implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Maps played";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const amountMatches = matches
                .filter((match) => {
                    return (
                        match.playerOne === player.uuid ||
                        match.playerTwo === player.uuid
                    );
                })
                .map((match) => match.playedMaps.length)
                .reduce((prev, cur) => prev + cur, 0);
            return {
                player: player.uuid,
                displayScore: amountMatches.toString(),
                sortingScore: amountMatches,
            };
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
