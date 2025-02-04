import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class SpinTheWheel implements AutomaticAchievement {
    name = "Spin the Wheel";
    description = [
        "Play 5 Maps",
        "Play 10 Maps",
        "Play 25 Maps",
        "Play 50 Maps",
        "Play 100 Maps",
        "Play 200 Maps",
        "Play 500 Maps",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.EXPERIENCE;
    levels = 7;

    public getDefaultData(): Record<string, number> {
        return {};
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<Record<string, number>>,
        playerTwoAchievement: Achievement<Record<string, number>>,
    ): Promise<void> {
        const nonForfeitMapLength = match.playedMaps.filter(
            (map) => !map.forfeit,
        ).length;

        playerOneAchievement.data[match.uuid] = nonForfeitMapLength;
        playerTwoAchievement.data[match.uuid] = nonForfeitMapLength;

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<Record<string, number>>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = {};
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
        achievement: Achievement<Record<string, number>>,
        achievementTimestamp: number,
    ) {
        let sumOfMaps = 0;
        for (const num of Object.values(achievement.data)) {
            sumOfMaps += num;
        }

        const levelRequirements = [5, 10, 25, 50, 100, 200, 500];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (sumOfMaps >= levelRequirements[idx]) {
                if (
                    achievement.achievedAt[idx] <= 0 ||
                    achievementTimestamp < achievement.achievedAt[idx]
                ) {
                    achievement.achievedAt[idx] = achievementTimestamp;
                }
            } else {
                achievement.achievedAt[idx] = 0;
            }
        }

        achievement.progression = [
            Math.min(1, sumOfMaps / 5),
            Math.min(1, sumOfMaps / 10),
            Math.min(1, sumOfMaps / 25),
            Math.min(1, sumOfMaps / 50),
            Math.min(1, sumOfMaps / 100),
            Math.min(1, sumOfMaps / 200),
            Math.min(1, sumOfMaps / 500),
        ];
    }
}
