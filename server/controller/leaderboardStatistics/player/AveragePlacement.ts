import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerAveragePlacement implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Average RR Placement";
    hasMaps = false;
    secondaryFilter = "Competitions played";
    defaultSecondaryFilter = 3;

    basedOn = ["placement" as const];

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const placements = await CompetitionPlacement.createQueryBuilder(
            "placement",
        )
            .innerJoin(
                Competition,
                "competition",
                "placement.competition = competition.tag",
            )
            .where("competition.officialCompetition = TRUE")
            .select(["placement.player", "placement.placement"])
            .getMany();

        const placementsOfPlayers: Record<string, number[]> = {};

        for (const placement of placements) {
            if (placement.placement == null) continue;
            placementsOfPlayers[placement.player] ??= [];
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
