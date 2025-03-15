import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap, getAllMaps } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

type AchievementDataType = Record<HitmanMap, number>;

export class OpenSeason extends AutomaticAchievement<AchievementDataType> {
    name = "Open Season";
    description = [
        "Play a spin on every map in a season",
        "Play 5 spins on every map in a season",
        "Play 10 spins on every map in a season",
        "Play 15 spins on every map in a season",
        "Play 20 spins on every map in a season",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
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
        const season1 = Math.min(
            achievement.data[HitmanMap.PARIS],
            achievement.data[HitmanMap.SAPIENZA],
            achievement.data[HitmanMap.MARRAKESH],
            achievement.data[HitmanMap.BANGKOK],
            achievement.data[HitmanMap.COLORADO],
            achievement.data[HitmanMap.HOKKAIDO],
        );
        const season2 = Math.min(
            achievement.data[HitmanMap.MIAMI],
            achievement.data[HitmanMap.SANTA_FORTUNA],
            achievement.data[HitmanMap.MUMBAI],
            achievement.data[HitmanMap.WHITTLETON_CREEK],
            achievement.data[HitmanMap.AMBROSE_ISLAND],
            achievement.data[HitmanMap.ISLE_OF_SGAIL],
            achievement.data[HitmanMap.NEW_YORK],
            achievement.data[HitmanMap.HAVEN_ISLAND],
        );
        const season3 = Math.min(
            achievement.data[HitmanMap.DUBAI],
            achievement.data[HitmanMap.DARTMOOR],
            achievement.data[HitmanMap.BERLIN],
            achievement.data[HitmanMap.CHONGQING],
            achievement.data[HitmanMap.MENDOZA],
        );
        const biggestSeason = Math.max(season1, season2, season3);

        const levelRequirements = [1, 5, 10, 15, 20];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (biggestSeason >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((requirement) =>
            Math.min(1, biggestSeason / requirement),
        );
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${biggestSeason} / ${requirement}`;
        });
    }
}
