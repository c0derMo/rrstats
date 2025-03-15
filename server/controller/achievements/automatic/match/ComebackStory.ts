import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class ComebackStory extends AutomaticAchievement<string[]> {
    name = "Comeback Story";
    description = [
        "Win against a player who previously beat you by at least six points",
    ];
    tier = [AchievementTier.GOLD];
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
            if (
                !playerTwoAchievement.data.includes(match.playerOne) &&
                match.playerOneScore >= match.playerTwoScore + 6
            ) {
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
            if (
                !playerOneAchievement.data.includes(match.playerTwo) &&
                match.playerTwoScore >= match.playerOneScore + 6
            ) {
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
