import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerTitlesWon implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Titles won";
    hasMaps = false;

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
            .andWhere("placement.placement == 1")
            .select(["placement.player"])
            .getMany();
        const appearances: Record<string, number> = {};

        for (const placement of placements) {
            appearances[placement.player] ??= 0;
            appearances[placement.player] += 1;
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in appearances) {
            result.push({
                player: player,
                displayScore: appearances[player].toString(),
                sortingScore: appearances[player],
            });
        }
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
