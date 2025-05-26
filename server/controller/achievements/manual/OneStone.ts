import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class OneStone implements ManualAchievement {
    name = "One Stone";
    description = ["Kill 2 targets within 10 seconds of each other"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP;
    levels = 1;
    manual = true;
    manualRequiresVideo = true;
}
