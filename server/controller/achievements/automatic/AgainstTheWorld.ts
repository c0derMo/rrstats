import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class AgainstTheWorld implements AutomaticAchievement {
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

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<string[]>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = [];
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
        achievement: Achievement<string[]>,
        achievementTimestamp: number,
    ) {
        const levelRequirements = [1, 2, 3, 4, 5];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data.length >= levelRequirements[idx]) {
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

        achievement.progression = levelRequirements.map((requirement) => {
            return Math.min(1, achievement.data.length / requirement);
        });
    }
}
