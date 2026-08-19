import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerRRAppearances extends BaseLeaderboardStatistic {
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
            .select(["placement.player", "placement.competition"])
            .orderBy("competition.startingTimestamp", "ASC")
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
                    Participations: appearances[player].size,
                    First: [...appearances[player]][0],
                    Last: [...appearances[player]][
                        appearances[player].size - 1
                    ],
                },
                order: 0,
                value: appearances[player].size,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Roulette Rivals Participations",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Participations", type: LeaderboardColumnType.TEXT },
                { name: "First", type: LeaderboardColumnType.TEXT },
                { name: "Last", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
