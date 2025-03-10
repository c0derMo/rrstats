import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";

type AchievementData = Record<HitmanMap, number>;

export class StayCation extends AutomaticAchievement<AchievementData> {
    name = "Stay-Cation";
    description = ["Play the same map 3 matches in a row"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.STREAK;
    levels = 1;

    public getDefaultData(): AchievementData {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result as AchievementData;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<AchievementData>,
        playerTwoAchievement: Achievement<AchievementData>,
    ): Promise<void> {
        const playedThisMatch = match.playedMaps.map((map) => map.map);

        for (const map of getAllMaps()) {
            if (playedThisMatch.includes(map)) {
                playerOneAchievement.data[map] += 1;
                playerTwoAchievement.data[map] += 1;
            } else {
                playerOneAchievement.data[map] = 0;
                playerTwoAchievement.data[map] = 0;
            }
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<AchievementData>,
        timestamp: number,
    ) {
        const longestStreak = Math.max(...Object.values(achievement.data));

        if (longestStreak >= 3) {
            achievement.achieveIfNotAchieved(timestamp);
        }

        achievement.progression = [Math.min(1, longestStreak / 3)];
    }
}
