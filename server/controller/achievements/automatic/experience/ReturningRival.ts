import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class ReturningRival extends AutomaticAchievement<string[]> {
    name = "Returning Rival";
    description = [
        "Participate in 2 Roulette Rivals tournaments",
        "Participate in 5 Roulette Rivals tournaments",
        "Participate in 10 Roulette Rivals tournaments",
        "Participate in 15 Roulette Rivals tournaments",
        "Participate in 20 Roulette Rivals tournaments",
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

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (!playerOneAchievement.data.includes(match.competition)) {
            playerOneAchievement.data.push(match.competition);
        }
        if (!playerTwoAchievement.data.includes(match.competition)) {
            playerTwoAchievement.data.push(match.competition);
        }

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<string[]>,
        achievementTimestamp: number,
        match: string,
    ) {
        const levelRequirements = [2, 5, 10, 15, 20];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data.length >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(
                    achievementTimestamp,
                    idx,
                    true,
                    match,
                );
            }
        }

        achievement.progression = levelRequirements.map((requirement) => {
            return Math.min(1, achievement.data.length / requirement);
        });
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${achievement.data.length} / ${requirement}`;
        });
    }
}
