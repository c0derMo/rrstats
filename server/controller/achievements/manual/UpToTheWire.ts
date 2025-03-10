import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class UpToTheWire implements ManualAchievement {
    name = "Up to the Wire";
    description = ["Lose a photofinish"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MISC;
    levels = 1;
    manual = true;
}
