import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import AchievementController from "../../AchievementController";

interface AchievementCount {
    player: string;
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
}

export class PlayerAchievements implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Achievements";
    hasMaps = false;
    explanatoryText =
        "Number of achievements, ranked by Platinum, Gold, Silver and Bronze.";

    async calculate(players: IPlayer[]): Promise<LeaderboardPlayerEntry[]> {
        const result: LeaderboardPlayerEntry[] = [];

        const tmp: AchievementCount[] = [];
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
            tmp.push({
                player: player.uuid,
                platinum: achievedPlatinum,
                gold: achievedGold,
                silver: achievedSilver,
                bronze: achievedBronze,
            });
        }

        tmp.sort((a, b) => b.bronze - a.bronze);
        tmp.sort((a, b) => b.silver - a.silver);
        tmp.sort((a, b) => b.gold - a.gold);
        tmp.sort((a, b) => b.platinum - a.platinum);

        for (const player of tmp) {
            const sortingScore = tmp.findIndex((count) => {
                return (
                    count.platinum === player.platinum &&
                    count.gold === player.gold &&
                    count.silver === player.silver &&
                    count.bronze === player.bronze
                );
            });
            result.push({
                player: player.player,
                sortingScore: sortingScore,
                displayScore: `${player.platinum} Platinum - ${player.gold} Gold - ${player.silver} Silver - ${player.bronze} Bronze`,
            });
        }

        return result;
    }
}
