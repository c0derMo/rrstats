import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

type AchievementDataType = Record<HitmanMap, number>;

export class GettingMileage extends AutomaticAchievement<AchievementDataType> {
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

    public getDefaultData(): AchievementDataType {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result as AchievementDataType;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<AchievementDataType>,
        playerTwoAchievement: Achievement<AchievementDataType>,
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

    private checkCondition(
        achievement: Achievement<Record<HitmanMap, number>>,
        achievementTimestamp: number,
    ) {
        const mostPlayed = Math.max(...Object.values(achievement.data));

        const levelRequirements = [5, 10, 15, 20, 30];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (mostPlayed >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((requirement) =>
            Math.min(1, mostPlayed / requirement),
        );
    }
}
