import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerRRWCAppearances extends BaseLeaderboardStatistic {
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
            .getMany();
        const appearances: Record<string, Set<string>> = {};

        for (const placement of placements) {
            if (!placement.competition.toLowerCase().includes("wc")) {
                continue;
            }
            appearances[placement.player] ??= new Set();
            appearances[placement.player].add(placement.competition);
        }

        const result: LeaderboardRow[] = [];
        for (const player in appearances) {
            result.push({
                columns: {
                    Player: player,
                    Appearances: appearances[player].size,
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
            name: "RRWC Participations",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Appearances", type: LeaderboardColumnType.TEXT },
            ],
        };
    }
}
