import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class Untouchable extends AutomaticAchievement<Record<string, number>> {
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
            if (playerOneAchievement.data[match.competition] <= 0) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
            if (playerTwoAchievement.data[match.competition] <= 0) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }
}
