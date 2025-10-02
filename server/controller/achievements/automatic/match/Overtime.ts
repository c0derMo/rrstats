import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class Overtime extends AutomaticAchievement<number> {
    name = "Overtime";
    description = [
        "Play 5 maps in the same match",
        "Play 6 maps in the same match",
        "Play 7 maps in the same match",
        "Play 8 maps in the same match",
        "Play 9 maps in the same match",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MATCH;
    levels = 5;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        const requirements = [5, 6, 7, 8, 9];

        for (let idx = 0; idx < requirements.length; idx++) {
            if (match.playedMaps.length < requirements[idx]) {
                break;
            }

            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                idx,
                true,
                match.uuid,
            );
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                idx,
                true,
                match.uuid,
            );
        }
    }
}
