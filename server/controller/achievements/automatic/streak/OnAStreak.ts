import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class OnAStreak extends AutomaticAchievement<number> {
    name = "On a Streak";
    description = [
        "Win 2 matches in a row",
        "Win 5 matches in a row",
        "Win 10 matches in a row",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.STREAK;
    levels = 3;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (match.playerOneScore > match.playerTwoScore) {
            playerOneAchievement.data += 1;
            playerTwoAchievement.data = 0;
        } else if (match.playerTwoScore > match.playerOneScore) {
            playerOneAchievement.data = 0;
            playerTwoAchievement.data += 1;
        } else {
            playerOneAchievement.data = 0;
            playerTwoAchievement.data = 0;
        }
        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<number>,
        timestamp: number,
    ) {
        const requirements = [2, 5, 10];

        for (let idx = 0; idx < requirements.length; idx++) {
            if (achievement.data >= requirements[idx]) {
                achievement.achieveIfNotAchieved(timestamp, idx);
            }
        }

        achievement.progression = requirements.map((req) =>
            Math.min(1, achievement.data / req),
        );
    }
}
