import type { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type { LeaderboardPlayerEntry } from "~/utils/interfaces/LeaderboardEntry";

export class PlayerAveragePlacement implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Average RR Placement";
    hasMaps = false;
    secondaryFilter = "Competitions played";

    calculate(
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ): LeaderboardPlayerEntry[] {
        const placementsOfPlayers: Record<string, number[]> = {};

        for (const placement of placements) {
            if (placement.placement == null) continue;
            if (placementsOfPlayers[placement.player] == null)
                placementsOfPlayers[placement.player] = [];
            placementsOfPlayers[placement.player].push(placement.placement);
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in placementsOfPlayers) {
            const allPlacements = placementsOfPlayers[player].reduce(
                (prev, cur) => prev + cur,
                0,
            );
            const average = allPlacements / placementsOfPlayers[player].length;
            result.push({
                player: player,
                displayScore: average.toFixed(1),
                sortingScore: average,
                secondaryScore: placementsOfPlayers[player].length,
            });
        }
        result.sort((a, b) => a.sortingScore - b.sortingScore);

        return result;
    }
}
