import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class RoulettePlayer implements AutomaticAchievement {
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

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (!playerOneAchievement.data.includes(match.uuid)) {
            playerOneAchievement.data.push(match.uuid);
        }
        if (!playerTwoAchievement.data.includes(match.uuid)) {
            playerTwoAchievement.data.push(match.uuid);
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
        const levelRequirements = [1, 5, 10, 25, 50, 75, 100];

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
