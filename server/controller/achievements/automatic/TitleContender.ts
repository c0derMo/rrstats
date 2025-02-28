import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class TitleContender implements AutomaticAchievement {
    name = "Title Contender";
    description = ["Win all your matches in the RRWC Group Stage"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    public getDefaultData(): Record<string, number> {
        return {};
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<Record<string, number>>,
        playerTwoAchievement: Achievement<Record<string, number>>,
    ): Promise<void> {
        if (!match.competition.toLowerCase().includes("rrwc")) {
            return;
        }

        if (match.round.toLowerCase().includes("group")) {
            if (playerOneAchievement.data[match.competition] == null) {
                playerOneAchievement.data[match.competition] = 0;
            }
            if (playerTwoAchievement.data[match.competition] == null) {
                playerTwoAchievement.data[match.competition] = 0;
            }
            if (match.playerOneScore >= match.playerTwoScore) {
                playerTwoAchievement.data[match.competition] += 1;
            }
            if (match.playerTwoScore >= match.playerOneScore) {
                playerOneAchievement.data[match.competition] += 1;
            }
        } else {
            if (
                playerOneAchievement.data[match.competition] <= 0 &&
                playerOneAchievement.achievedAt[0] <= 0
            ) {
                playerOneAchievement.achievedAt[0] = match.timestamp;
                playerOneAchievement.progression[0] = 1;
            }
            if (
                playerTwoAchievement.data[match.competition] <= 0 &&
                playerTwoAchievement.achievedAt[0] <= 0
            ) {
                playerTwoAchievement.achievedAt[0] = match.timestamp;
                playerTwoAchievement.progression[0] = 1;
            }
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<Record<string, number>>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
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
