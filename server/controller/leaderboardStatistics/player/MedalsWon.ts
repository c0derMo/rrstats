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
                    Gold: medals.gold,
                    Silver: medals.silver,
                    Bronze: medals.bronze,
                },
                order: 0,
                value: medals.gold,
            };
        });

        result.sort((a, b) => b.columns["Bronze"] - a.columns["Bronze"]);
        result.sort((a, b) => b.columns["Silver"] - a.columns["Silver"]);
        result.sort((a, b) => b.columns["Gold"] - a.columns["Gold"]);

        result.forEach((player) => {
            const placement = result.findIndex((otherPlayer) => {
                return (
                    otherPlayer.columns.Gold === player.columns.Gold &&
                    otherPlayer.columns.Silver === player.columns.Silver &&
                    otherPlayer.columns.Bronze === player.columns.Bronze
                );
            });
            player.order = placement;
        });

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
                {
                    name: "Gold",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Silver",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
                {
                    name: "Bronze",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
            ],
        };
    }
}
