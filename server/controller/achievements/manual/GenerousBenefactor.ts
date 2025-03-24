import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import type { ManualAchievement } from "../../AchievementController";

export class GenerousBenefactor implements ManualAchievement {
    name = "Generous Benefactor";
    description = ["Sponsor a Roulette Rivals tournament"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.MISC;
    levels = 1;
    manual = true;
}
