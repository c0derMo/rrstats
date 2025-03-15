import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class PartnersDown extends AutomaticAchievement<number> {
    name = "Partners Down";
    description = ["Win a Dubai and Dartmoor spin in the same match"];
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
        let dubWin = -1;
        let darWin = -1;

        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }

            if (map.map === HitmanMap.DUBAI) {
                dubWin = map.winner;
            }
            if (map.map === HitmanMap.DARTMOOR) {
                darWin = map.winner;
            }
        }

        if (darWin === dubWin && darWin === WinningPlayer.PLAYER_ONE) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        } else if (darWin === dubWin && darWin === WinningPlayer.PLAYER_TWO) {
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
