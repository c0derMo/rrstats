import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class TheCulling extends AutomaticAchievement<number> {
    name = "The Culling";
    description = ["Advance to the Knockout Stage of a World Championship"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.TOURNAMENT;
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
            !match.competition.toLowerCase().includes("rrwc") ||
            match.round.toLowerCase().includes("group")
        ) {
            return;
        }

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
