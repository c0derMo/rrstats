import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerGFAppearances implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Grand Final Appearances";
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
            .andWhere("placement.placement <= 2")
            .select([
                "placement.player",
                "placement.placement",
                "placement.competition",
            ])
            .getMany();
        const appearances: Record<string, Set<string>> = {};

        for (const placement of placements) {
            appearances[placement.player] ??= new Set();
            appearances[placement.player].add(placement.competition);
        }

        const result: LeaderboardPlayerEntry[] = [];
        for (const player in appearances) {
            result.push({
                player: player,
                displayScore: appearances[player].size.toString(),
                sortingScore: appearances[player].size,
            });
        }
        result.sort((a, b) => b.sortingScore - a.sortingScore);

        return result;
    }
}
