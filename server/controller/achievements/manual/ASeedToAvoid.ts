import type { ManualAchievement } from "../../AchievementController";

export class ASeedToAvoid implements ManualAchievement {
    name = "A Seed to Avoid";
    description = ["Win your group in an RRWC Group Stage"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;
    manual = true;
    manualRequiresVideo = true;
}
