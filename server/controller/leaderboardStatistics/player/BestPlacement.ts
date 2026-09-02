import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

interface BestPlacementData extends LeaderboardRow {
    columns: {
        Player: string;
        "Best placement": number;
        "Times achieved": number;
        "First achieved in competition": string;
        "Competitions played": number;
    };
}

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
            .orderBy("competition.startingTimestamp", "ASC")
            .getMany();

        const placementsOfPlayer = new DefaultedMap<
            string,
            {
                best: number;
                competition: string;
                competitionCount: number;
                amount: number;
            }
        >(() => {
            return {
                best: -1,
                competition: "",
                competitionCount: 0,
                amount: 0,
            };
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
                placementsOfPlayer.get(placement.player).amount = 1;
            } else if (
                placement.placement ===
                placementsOfPlayer.get(placement.player).best
            ) {
                placementsOfPlayer.get(placement.player).amount += 1;
            }
            placementsOfPlayer.get(placement.player).competitionCount += 1;
        }

        const result: BestPlacementData[] = placementsOfPlayer.mapAll(
            (player, stats) => {
                return {
                    columns: {
                        Player: player,
                        "Best placement": stats.best,
                        "Times achieved": stats.amount,
                        "First achieved in competition": stats.competition,
                        "Competitions played": stats.competitionCount,
                    },
                    order: 0,
                    value: stats.best,
                };
            },
        );

        result.sort(
            (a, b) => b.columns["Times achieved"] - a.columns["Times achieved"],
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
                { name: "Times achieved", type: LeaderboardColumnType.TEXT },
                {
                    name: "First achieved in competition",
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
