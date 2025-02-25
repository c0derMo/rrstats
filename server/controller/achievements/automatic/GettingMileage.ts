import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class GettingMileage implements AutomaticAchievement {
    name = "Getting Mileage";
    description = [
        "Play 5 spins on the same map",
        "Play 10 spins on the same map",
        "Play 15 spins on the same map",
        "Play 20 spins on the same map",
        "Play 30 spins on the same map",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.EXPERIENCE;
    levels = 5;

    public getDefaultData(): Record<HitmanMap, number> {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<Record<HitmanMap, number>>,
        playerTwoAchievement: Achievement<Record<HitmanMap, number>>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            playerOneAchievement.data[map.map] += 1;
            playerTwoAchievement.data[map.map] += 1;
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<Record<HitmanMap, number>>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
        }

        for (const match of matches) {
            await this.update(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
            );
        }
    }

    private checkCondition(
        achievement: Achievement<Record<HitmanMap, number>>,
        achievementTimestamp: number,
    ) {
        const mostPlayed = Math.max(...Object.values(achievement.data));

        const levelRequirements = [5, 10, 15, 20, 30];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (mostPlayed >= levelRequirements[idx]) {
                if (achievement.achievedAt[idx] <= 0) {
                    achievement.achievedAt[idx] = achievementTimestamp;
                }
            } else {
                achievement.achievedAt[idx] = 0;
            }
        }

        achievement.progression = levelRequirements.map((requirement) =>
            Math.min(1, mostPlayed / requirement),
        );
    }
}
