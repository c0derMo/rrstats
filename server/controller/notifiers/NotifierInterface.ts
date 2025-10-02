import type { Achievement } from "~~/server/model/Achievement";
import type {
    ManualAchievement,
    ManualAchievementData,
} from "../AchievementController";

export interface Notifier {
    sendManualAchievementSubmissionNotification(
        achievement: ManualAchievement,
        submission: Achievement<ManualAchievementData>,
    ): Promise<void>;
    updateManualAchievementVerified(
        submission: Achievement<ManualAchievementData>,
    ): Promise<void>;
}
