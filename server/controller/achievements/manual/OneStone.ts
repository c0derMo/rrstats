import { AchievementTier } from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class OneStone implements ManualAchievement {
    name = "One Stone";
    description = ["Kill 2 targets within 5 seconds of each other"];
    tier = [AchievementTier.GOLD];
    category = "Map";
    levels = 1;
    manual = true;
}
