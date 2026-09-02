import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

interface MedalsCount extends LeaderboardRow {
    columns: {
        Player: string;
        Gold: number;
        Silver: number;
        Bronze: number;
    };
}

export class PlayerMedalsWon extends BaseLeaderboardStatistic {
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
            .orderBy("competition.startingTimestamp", "ASC")
            .andWhere("placement.placement <= 3")
            .select(["placement.placement", "placement.player"])
            .getMany();
        const appearances = new DefaultedMap<
            string,
            { gold: number; silver: number; bronze: number }
        >(() => {
            return { gold: 0, silver: 0, bronze: 0 };
        });

        for (const placement of placements) {
            if (placement.placement === 1) {
                appearances.get(placement.player).gold += 1;
            } else if (placement.placement === 2) {
                appearances.get(placement.player).silver += 1;
            } else if (placement.placement === 3) {
                appearances.get(placement.player).bronze += 1;
            }
        }

        const result: MedalsCount[] = appearances.mapAll((player, medals) => {
            return {
                columns: {
                    Player: player,
                    Total: medals.gold + medals.silver + medals.bronze,
                    Gold: medals.gold,
                    Silver: medals.silver,
                    Bronze: medals.bronze,
                },
                order: 0,
                value: medals.gold + medals.silver + medals.bronze,
            };
        });

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most medals won",
            category: "player",
            subcategory: "Participation",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Total", type: LeaderboardColumnType.TEXT },
                {
                    name: "Gold",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                    color: "bg-golden",
                },
                {
                    name: "Silver",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                    color: "bg-silver",
                },
                {
                    name: "Bronze",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                    color: "bg-bronze",
                },
            ],
        };
    }
}
