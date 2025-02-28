import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class Untouchable implements AutomaticAchievement {
    name = "Untouchable";
    description = ["Obtain all possible points in an RRWC Group Stage"];
    tier = [AchievementTier.PLATINUM];
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
            playerTwoAchievement.data[match.competition] +=
                match.playerOneScore;
            playerOneAchievement.data[match.competition] +=
                match.playerTwoScore;
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
