import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class ASeedToAvoid implements ManualAchievement {
    name = "A Seed to Avoid";
    description = ["Win your group in the RRWC Group Stage"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;
    manual = true;
}
