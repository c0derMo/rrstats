import type { ManualAchievement } from "../../AchievementController";

export class RecordHolder implements ManualAchievement {
    name = "Record Holder";
    description = ["Have a map record of yours last a month"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TIME;
    levels = 1;
    manual = true;
}
