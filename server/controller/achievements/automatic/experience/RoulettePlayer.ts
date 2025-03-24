import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class RoulettePlayer extends AutomaticAchievement<number> {
    name = "Roulette Player";
    description = [
        "Play a match",
        "Play 5 matches",
        "Play 10 matches",
        "Play 25 matches",
        "Play 50 matches",
        "Play 75 matches",
        "Play 100 matches",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.EXPERIENCE;
    levels = 7;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        playerOneAchievement.data += 1;
        playerTwoAchievement.data += 1;

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<number>,
        achievementTimestamp: number,
        match: string,
    ) {
        const levelRequirements = [1, 5, 10, 25, 50, 75, 100];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(
                    achievementTimestamp,
                    idx,
                    false,
                    match,
                );
            }
        }

        achievement.progression = levelRequirements.map((requirement) => {
            return Math.min(1, achievement.data / requirement);
        });
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${achievement.data} / ${requirement}`;
        });
    }
}
