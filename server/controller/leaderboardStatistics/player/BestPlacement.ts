import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export class PlayerBestPlacement extends BaseLeaderboardStatistic {
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
            .select([
                "placement.player",
                "placement.placement",
                "placement.competition",
            ])
            .getMany();

        const placementsOfPlayer = new DefaultedMap<
            string,
            { best: number; competition: string; competitionCount: number }
        >(() => {
            return { best: -1, competition: "", competitionCount: 0 };
        });

        for (const placement of placements) {
            if (placement.placement == null) continue;
            if (
                !placementsOfPlayer.has(placement.player) ||
                placement.placement <
                    placementsOfPlayer.get(placement.player).best
            ) {
                placementsOfPlayer.get(placement.player).best =
                    placement.placement;
                placementsOfPlayer.get(placement.player).competition =
                    placement.competition;
            }
            placementsOfPlayer.get(placement.player).competitionCount += 1;
        }

        const result: LeaderboardRow[] = placementsOfPlayer.mapAll(
            (player, stats) => {
                return {
                    columns: {
                        Player: player,
                        "Best placement": stats.best,
                        "Achieved in competition": stats.competition,
                        "Competitions played": stats.competitionCount,
                    },
                    order: 0,
                    value: stats.best,
                };
            },
        );

        this.sortAndInferPlacementByValue(result, "ASC");
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Best RR Placement",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Best placement", type: LeaderboardColumnType.TEXT },
                {
                    name: "Achieved in competition",
                    type: LeaderboardColumnType.TEXT,
                },
                {
                    name: "Competitions played",
                    type: LeaderboardColumnType.TEXT,
                    filterable: LeaderboardFilterType.NUMERIC,
                    defaultFilter: 1,
                },
            ],
        };
    }
}
