import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class OverTheHump extends AutomaticAchievement<number> {
    name = "Over the Hump";
    description = ["Play a Santa Fortuna and Mumbai spin in the same match"];
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
        if (
            match.playedMaps.find((m) => m.map === HitmanMap.MUMBAI) != null &&
            match.playedMaps.find((m) => m.map === HitmanMap.SANTA_FORTUNA) !=
                null
        ) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
