import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerGFAppearances extends BaseLeaderboardStatistic {
    type = "player" as const;
    name = "Grand Final Appearances";
    hasMaps = false;

    basedOn() {
        return ["placement" as const];
    };

    async calculate(): Promise<void> {
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

        const result: LeaderboardRow[] = [];
        for (const player in appearances) {
            result.push({
                columns: {
                    "Player": player,
                    "Finals played": appearances[player].size
                },
                value: appearances[player].size,
                order: 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Grand Final Appearances",
            category: "player",
            subcategory: "Participation",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Finals played", type: LeaderboardColumnType.TEXT },
            ]
        }
    };
}
