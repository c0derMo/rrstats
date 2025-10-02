import type { ManualAchievement } from "../../AchievementController";

export class TheConstant implements ManualAchievement {
    name = "The Constant";
    description = [
        "Pick the same map for all matches in your RRWC Group Stage",
    ];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.STREAK;
    levels = 1;
    manual = true;
}
