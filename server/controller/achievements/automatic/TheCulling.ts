import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class TheCulling implements AutomaticAchievement {
    name = "The Culling";
    description = ["Advance to the Knockout Stage of a World Championship"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

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
            !match.round.toLowerCase().includes("group")
        ) {
            return;
        }

        if (playerOneAchievement.achievedAt[0] <= 0) {
            playerOneAchievement.achievedAt[0] = match.timestamp;
            playerOneAchievement.progression[0] = 1;
        }
        if (playerTwoAchievement.achievedAt[0] <= 0) {
            playerTwoAchievement.achievedAt[0] = match.timestamp;
            playerTwoAchievement.progression[0] = 1;
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].achievedAt = [0];
            achievements[player].progression = [0];
        }

        for (const match of matches) {
            await this.update(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
            );
        }
    }
}
