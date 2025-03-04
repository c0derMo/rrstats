import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class FamilyMatters extends AutomaticAchievement<number> {
    name = "Family Matters";
    description = ["Win a Miami and Isle of Sgàil spin in the same match"];
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
        let miaWin = -1;
        let sgaWin = -1;

        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }

            if (map.map === HitmanMap.MIAMI) {
                miaWin = map.winner;
            }
            if (map.map === HitmanMap.ISLE_OF_SGAIL) {
                sgaWin = map.winner;
            }
        }

        if (miaWin === sgaWin && miaWin === WinningPlayer.PLAYER_ONE) {
            playerOneAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        } else if (miaWin === sgaWin && miaWin === WinningPlayer.PLAYER_TWO) {
            playerTwoAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
    }
}
