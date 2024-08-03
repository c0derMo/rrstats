import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class PlayerMatchesPlayed implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Matches played";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const amountMatches = filterForfeitMatches(matches).filter(
                (match) => {
                    return (
                        match.playerOne === player.uuid ||
                        match.playerTwo === player.uuid
                    );
                },
            );
            return {
                player: player.uuid,
                displayScore: amountMatches.length.toString(),
                sortingScore: amountMatches.length,
            };
        });
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
