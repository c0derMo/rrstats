import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class BestServedCold extends AutomaticAchievement<string[]> {
    name = "Best Served Cold";
    description = ["Beat an opponent who previously defeated you"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MATCH;
    levels = 1;

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (match.playerOneScore > match.playerTwoScore) {
            if (!playerTwoAchievement.data.includes(match.playerOne)) {
                playerTwoAchievement.data.push(match.playerOne);
            }
            if (playerOneAchievement.data.includes(match.playerTwo)) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                    match.uuid,
                );
            }
        } else if (match.playerTwoScore > match.playerOneScore) {
            if (!playerOneAchievement.data.includes(match.playerTwo)) {
                playerOneAchievement.data.push(match.playerTwo);
            }
            if (playerTwoAchievement.data.includes(match.playerOne)) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                    match.uuid,
                );
            }
        }
    }
}
