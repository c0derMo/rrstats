import type { ManualAchievement } from "../../AchievementController";

export class RecordSmasher implements ManualAchievement {
    name = "Record Smasher";
    description = ["Have a map record of yours last a year"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TIME;
    levels = 1;
    manual = true;
}
