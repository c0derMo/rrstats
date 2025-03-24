import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class DownToTheWire implements ManualAchievement {
    name = "Down to the Wire";
    description = ["Win a photofinish"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MISC;
    levels = 1;
    manual = true;
    manualRequiresVideo = true;
}
