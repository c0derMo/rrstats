import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class OverTheHump extends AutomaticAchievement<number> {
    name = "Over the Hump";
    description = ["Win a Santa Fortuna and Mumbai spin in the same match"];
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
        let sfWin = -1;
        let mumWin = -1;

        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }

            if (map.map === HitmanMap.MUMBAI) {
                mumWin = map.winner;
            }
            if (map.map === HitmanMap.SANTA_FORTUNA) {
                sfWin = map.winner;
            }
        }

        if (mumWin === sfWin && mumWin === WinningPlayer.PLAYER_ONE) {
            playerOneAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        } else if (mumWin === sfWin && mumWin === WinningPlayer.PLAYER_TWO) {
            playerTwoAchievement.achieveIfNotAchieved(match.timestamp, 0, true);
        }
    }
}
