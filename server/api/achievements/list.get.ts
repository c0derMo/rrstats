import AchievementController from "~~/server/controller/AchievementController";
import ld from "lodash";

export default defineEventHandler<AchievementInfo[]>(() => {
    const allAchievements = [
        ...AchievementController.automaticAchievements,
        ...AchievementController.manualAchievements,
    ];

    const strippedAchievements = allAchievements.map((achievement) => {
        return ld.pick(achievement, [
            "name",
            "description",
            "tier",
            "manual",
            "category",
            "levels",
        ]);
    });

    return strippedAchievements as AchievementInfo[];
});
