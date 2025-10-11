import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";

export class PlayerRRAppearances implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Roulette Rivals Participations";
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
            .select(["placement.player", "placement.competition"])
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
