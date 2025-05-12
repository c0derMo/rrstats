import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class TitleContender extends AutomaticAchievement<
    Record<string, number>
> {
    name = "Title Contender";
    description = ["Win all your matches in an RRWC Group Stage"];
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
