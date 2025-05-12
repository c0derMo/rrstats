import AchievementController from "~/server/controller/AchievementController";

export default defineEventHandler<Promise<Record<string, number[]>>>(
    async () => {
        return await AchievementController.getAchievementStatistics();
    },
);
