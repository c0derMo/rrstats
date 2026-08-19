import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerTitlesWon extends BaseLeaderboardStatistic {
    basedOn() {
        return ["placement" as const];
    }

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
            .andWhere("placement.placement = 1")
            .select(["placement.player"])
            .getMany();
        const appearances: Record<string, number> = {};

        for (const placement of placements) {
            appearances[placement.player] ??= 0;
            appearances[placement.player] += 1;
        }

        const result: LeaderboardRow[] = [];
        for (const player in appearances) {
            result.push({
                columns: {
                    Player: player,
                    "Titles won": appearances[player],
                },
                value: appearances[player],
                order: 0,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Titles won",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Titles won", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
