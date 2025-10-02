import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class Sweeper extends AutomaticAchievement<number> {
    name = "Sweeper";
    description = ["Win every map in a match (at least six points)"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MATCH;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (match.playerOneScore >= 6 && match.playerTwoScore === 0) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        } else if (match.playerTwoScore >= 6 && match.playerOneScore === 0) {
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
