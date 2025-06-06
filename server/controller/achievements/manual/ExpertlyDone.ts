import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class ExpertlyDone implements ManualAchievement {
    name = "Expertly Done";
    description = ["Win a match without restarting (at least six points)"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MATCH;
    levels = 1;
    manual = true;
    manualRequiresVideo = true;
}
