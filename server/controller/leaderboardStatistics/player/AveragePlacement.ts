import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerAveragePlacement extends BaseLeaderboardStatistic {
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
            .select(["placement.player", "placement.placement"])
            .getMany();

        const placementsOfPlayers: Record<string, number[]> = {};

        for (const placement of placements) {
            if (placement.placement == null) continue;
            placementsOfPlayers[placement.player] ??= [];
            placementsOfPlayers[placement.player].push(placement.placement);
        }

        const result: LeaderboardRow[] = [];
        for (const player in placementsOfPlayers) {
            const allPlacements = placementsOfPlayers[player].reduce(
                (prev, cur) => prev + cur,
                0,
            );
            const average = allPlacements / placementsOfPlayers[player].length;
            result.push({
                columns: {
                    "Player": player,
                    "Average placement": Math.round(average * 100) / 100,
                    "Competitions played": placementsOfPlayers[player].length,
                },
                order: 0,
                value: average
            });
        }
        this.sortAndInferPlacementByValue(result, 'ASC');
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Average RR Placement",
            category: "player",
            subcategory: "Participation",
            columns: [
                { name: "Placement", type: LeaderboardColumnType.PLACEMENT_TAG },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Average placement", type: LeaderboardColumnType.TEXT },
                { name: "Competitions played", type: LeaderboardColumnType.TEXT, filterable: LeaderboardFilterType.NUMERIC, defaultFilter: 3 },
            ]
        }
    };
}
