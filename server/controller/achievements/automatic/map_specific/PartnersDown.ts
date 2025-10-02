import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class PartnersDown extends AutomaticAchievement<number> {
    name = "Partners Down";
    description = ["Play a Dubai and Dartmoor spin in the same match"];
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
            match.playedMaps.find((m) => m.map === HitmanMap.DUBAI) != null &&
            match.playedMaps.find((m) => m.map === HitmanMap.DARTMOOR) != null
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
