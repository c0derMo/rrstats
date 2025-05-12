import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class RolfLured extends AutomaticAchievement<number> {
    name = "Rolf Lured";
    description = ["Win a Berlin spin in 10:07 or less"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MAP_SPECIFIC;
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
            if (map.forfeit) {
                continue;
            }
            if (map.map !== HitmanMap.BERLIN) {
                continue;
            }
            if (map.timeTaken <= 0) {
                continue;
            }
            if (map.timeTaken >= 607) {
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
