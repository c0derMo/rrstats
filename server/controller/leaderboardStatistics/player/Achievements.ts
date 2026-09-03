import AchievementController from "../../AchievementController";
import { Player } from "~~/server/model/Player";
import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

interface AchievementCount extends LeaderboardRow {
    columns: {
        Player: string;
        Total: number;
        Platinum: number;
        Gold: number;
        Silver: number;
        Bronze: number;
    };
}

export class PlayerAchievements extends BaseLeaderboardStatistic {
    basedOn() {
        return ["player" as const, "achievement" as const];
    }

    async calculate(): Promise<void> {
        const players = await Player.createQueryBuilder("player")
            .select(["player.uuid"])
            .getMany();

        const result: AchievementCount[] = [];
        for (const player of players) {
            const achievements =
                await AchievementController.getAchievementsOfPlayer(
                    player.uuid,
                );
            const achievedPlatinum = achievements
                .map((achievement) => {
                    return achievement.tier.filter(
                        (t, idx) =>
                            t === AchievementTier.PLATINUM &&
                            achievement.achievedAt[idx] > 0,
                    ).length;
                })
                .reduce((l, r) => l + r, 0);
            const achievedGold = achievements
                .map((achievement) => {
                    return achievement.tier.filter(
                        (t, idx) =>
                            t === AchievementTier.GOLD &&
                            achievement.achievedAt[idx] > 0,
                    ).length;
                })
                .reduce((l, r) => l + r, 0);
            const achievedSilver = achievements
                .map((achievement) => {
                    return achievement.tier.filter(
                        (t, idx) =>
                            t === AchievementTier.SILVER &&
                            achievement.achievedAt[idx] > 0,
                    ).length;
                })
                .reduce((l, r) => l + r, 0);
            const achievedBronze = achievements
                .map((achievement) => {
                    return achievement.tier.filter(
                        (t, idx) =>
                            t === AchievementTier.BRONZE &&
                            achievement.achievedAt[idx] > 0,
                    ).length;
                })
                .reduce((l, r) => l + r, 0);
            const total =
                achievedPlatinum +
                achievedGold +
                achievedSilver +
                achievedBronze;
            result.push({
                columns: {
                    Player: player.uuid,
                    Total: total,
                    Platinum: achievedPlatinum,
                    Gold: achievedGold,
                    Silver: achievedSilver,
                    Bronze: achievedBronze,
                },
                order: 0,
                value: total,
            });
        }

        this.sortAndInferPlacementByValue(result);
        this.cache = result;
    }

    getTableDefinition(): LeaderboardTableDefinition {
        return {
            name: "Most achievements",
            category: "player",
            subcategory: "Other",
            explanatoryText:
                "Number of achievements, ranked by Platinum, Gold, Silver and Bronze.",
            columns: [
                {
                    name: "Placement",
                    type: LeaderboardColumnType.PLACEMENT_TAG,
                },
                { name: "Player", type: LeaderboardColumnType.PLAYER_NAME },
                { name: "Total", type: LeaderboardColumnType.TEXT },
                {
                    name: "Platinum",
                    type: LeaderboardColumnType.TEXT,
                    sortable: true,
                },
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
