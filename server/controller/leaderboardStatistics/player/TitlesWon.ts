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
            .orderBy("competition.startingTimestamp", "ASC")
            .select(["placement.player", "placement.competition"])
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
                    Player: player,
                    "Titles won": appearances[player].size,
                    First: [...appearances[player]][0],
                    Last: [...appearances[player]][
                        appearances[player].size - 1
                    ],
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
            name: "Most titles won",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Titles won", type: LeaderboardColumnType.TEXT },
                { name: "First", type: LeaderboardColumnType.TEXT },
                { name: "Last", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
