import type { ManualAchievement } from "../../AchievementController";

export class TheWire implements ManualAchievement {
    name = "The Wire";
    description = ["Tie a photofinish"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MISC;
    levels = 1;
    manual = true;
    manualRequiresVideo = true;
}
