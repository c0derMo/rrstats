import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class ChrisX3 extends AutomaticAchievement<number> {
    name = "Chris X 3";
    description = ["Win a Marrakesh spin in 13:54 or less"];
    tier = [AchievementTier.BRONZE];
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
            if (map.map !== HitmanMap.MARRAKESH) {
                continue;
            }
            if (map.timeTaken <= 0) {
                continue;
            }
            if (map.timeTaken >= 834) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }
}
