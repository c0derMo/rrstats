import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

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
