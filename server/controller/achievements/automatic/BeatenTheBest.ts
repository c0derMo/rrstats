import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class BeatenTheBest implements AutomaticAchievement {
    name = "Beaten the Best";
    description = [
        "Win a match in the RRWC Knockout Stage",
        "Win 5 matches in the RRWC Knockout Stage",
        "Win 15 matches in the RRWC Knockout Stage",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.TOURNAMENT;
    levels = 3;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (
            !match.competition.toLowerCase().includes("rrwc") ||
            match.round.toLowerCase().includes("group")
        ) {
            return;
        }

        if (match.playerOneScore > match.playerTwoScore) {
            playerOneAchievement.data += 1;
        } else if (match.playerTwoScore > match.playerOneScore) {
            playerTwoAchievement.data += 1;
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt = [0, 0, 0];
            achievements[player].progression = [0, 0, 0];
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
        achievement: Achievement<number>,
        achievementTimestamp: number,
    ) {
        const levelRequirements = [1, 5, 15];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data >= levelRequirements[idx]) {
                if (achievement.achievedAt[idx] <= 0) {
                    achievement.achievedAt[idx] = achievementTimestamp;
                }
            } else {
                achievement.achievedAt[idx] = 0;
            }
        }

        achievement.progression = levelRequirements.map((requirement) =>
            Math.min(1, achievement.data / requirement),
        );
    }
}
