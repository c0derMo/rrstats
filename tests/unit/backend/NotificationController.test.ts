import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import AchievementController, {
    type ManualAchievementData,
} from "~~/server/controller/AchievementController";
import NotificationController from "~~/server/controller/NotificationController";
import { Achievement } from "~~/server/model/Achievement";

const CustomNotifier = {
    sendManualAchievementSubmissionNotification: vi.fn(),
    updateManualAchievementVerified: vi.fn(),
};

describe("NotificationController", () => {
    beforeAll(() => {
        NotificationController.addNotifier(CustomNotifier);
    });

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("sendManualAchievementSubmissionNotification", () => {
        const achievement = AchievementController.manualAchievements[0];
        const submission = new Achievement<ManualAchievementData>();

        NotificationController.sendManualAchievementSubmissionNotification(
            achievement,
            submission,
        );

        expect(
            CustomNotifier.sendManualAchievementSubmissionNotification,
        ).toHaveBeenCalledTimes(1);
        expect(
            CustomNotifier.sendManualAchievementSubmissionNotification,
        ).toHaveBeenCalledWith(achievement, submission);
    });

    test("updateManualAchievementVerified", () => {
        const submission = new Achievement<ManualAchievementData>();

        NotificationController.updateManualAchievementVerified(submission);

        expect(
            CustomNotifier.updateManualAchievementVerified,
        ).toHaveBeenCalledTimes(1);
        expect(
            CustomNotifier.updateManualAchievementVerified,
        ).toHaveBeenCalledWith(submission);
    });
});
