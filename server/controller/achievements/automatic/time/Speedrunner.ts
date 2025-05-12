import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class Speedrunner extends AutomaticAchievement<number> {
    name = "Speedrunner";
    description = ["Win a spin in 3:00 or less"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.TIME;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.timeTaken > 180 || map.timeTaken <= 0) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                    match.uuid,
                );
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
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
