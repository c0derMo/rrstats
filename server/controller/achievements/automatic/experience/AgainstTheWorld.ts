import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class AgainstTheWorld extends AutomaticAchievement<string[]> {
    name = "Against the World";
    description = [
        "Participate in a Roulette Rivals World Championship",
        "Participate in 2 Roulette Rivals World Championships",
        "Participate in 3 Roulette Rivals World Championships",
        "Participate in 4 Roulette Rivals World Championships",
        "Participate in 5 Roulette Rivals World Championships",
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

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (!match.competition.toLowerCase().includes("wc")) {
            return;
        }
        if (!playerOneAchievement.data.includes(match.competition)) {
            playerOneAchievement.data.push(match.competition);
        }
        if (!playerTwoAchievement.data.includes(match.competition)) {
            playerTwoAchievement.data.push(match.competition);
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<string[]>,
        achievementTimestamp: number,
    ) {
        const levelRequirements = [1, 2, 3, 4, 5];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data.length >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((requirement) => {
            return Math.min(1, achievement.data.length / requirement);
        });
    }
}
