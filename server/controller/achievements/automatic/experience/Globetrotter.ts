import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

type AchievementDataType = Record<HitmanMap, number>;

export class Globetrotter extends AutomaticAchievement<AchievementDataType> {
    name = "Globetrotter";
    description = [
        "Play a spin on every roulette map",
        "Play a spin on every roulette map 5 times",
        "Play a spin on every roulette map 10 times",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.EXPERIENCE;
    levels = 3;

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
        const lowestMapPlayed = Math.min(...Object.values(achievement.data));

        const levelRequirements = [1, 5, 10];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (lowestMapPlayed >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((req) =>
            Math.min(
                1,
                Object.values(achievement.data).filter((m) => m >= req).length /
                    19,
            ),
        );
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${Object.values(achievement.data).filter((m) => m >= requirement).length} / 19`;
        });
    }
}
