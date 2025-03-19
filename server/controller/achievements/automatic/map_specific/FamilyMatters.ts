import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class FamilyMatters extends AutomaticAchievement<number> {
    name = "Family Matters";
    description = ["Play a Miami and Isle of Sgàil spin in the same match"];
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
            match.playedMaps.find((m) => m.map === HitmanMap.MIAMI) != null &&
            match.playedMaps.find((m) => m.map === HitmanMap.ISLE_OF_SGAIL) !=
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
