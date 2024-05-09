import { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";
import { filterForfeitMatches } from "~/utils/matchUtils";

export class PlayerMapsPlayed implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Maps played";
    hasMaps = false;

    calculate(players: IPlayer[], matches: IMatch[]): LeaderboardPlayerEntry[] {
        const result: LeaderboardPlayerEntry[] = players.map((player) => {
            const amountMatches = filterForfeitMatches(matches)
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
