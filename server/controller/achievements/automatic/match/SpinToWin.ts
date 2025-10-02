import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class SpinToWin extends AutomaticAchievement<number> {
    name = "Spin to Win";
    description = [
        "Win a match",
        "Win 5 matches",
        "Win 10 matches",
        "Win 25 matches",
        "Win 50 matches",
        "Win 75 matches",
        "Win 100 matches",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MATCH;
    levels = 7;

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
            this.checkCondition(
                playerOneAchievement,
                match.timestamp,
                match.uuid,
            );
        } else if (match.playerTwoScore > match.playerOneScore) {
            playerTwoAchievement.data += 1;
            this.checkCondition(
                playerTwoAchievement,
                match.timestamp,
                match.uuid,
            );
        }
    }

    private checkCondition(
        achievement: Achievement<number>,
        timestamp: number,
        match: string,
    ) {
        const levelRequirements = [1, 5, 10, 25, 50, 75, 100];
        for (let i = 0; i < this.levels; i++) {
            if (achievement.data >= levelRequirements[i]) {
                achievement.achieveIfNotAchieved(timestamp, i, false, match);
            }
        }

        achievement.progression = levelRequirements.map((req) =>
            Math.min(1, achievement.data / req),
        );
        achievement.progressionString = levelRequirements.map(
            (req) => `${achievement.data} / ${req}`,
        );
    }
}
