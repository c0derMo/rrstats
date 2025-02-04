import AchievementController from "~/server/controller/AchievementController";
import { AuthController } from "~/server/controller/AuthController";
import { Achievement } from "~/server/model/Achievement";
import type { SubmittedAchievement } from "~/utils/interfaces/AchievementInfo";
import { IPermission } from "~/utils/interfaces/IUser";

type DataType = {
    video: string;
    note?: string;
};

type ResultType = SubmittedAchievement & {
    data: DataType;
    description: string;
};

export default defineEventHandler<Promise<ResultType[]>>(async (event) => {
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_ACHIEVEMENTS,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    const unverifiedAchievements = await Achievement.find({
        where: {
            verified: false,
        },
    });

    return unverifiedAchievements.map((a) => {
        const achievement = AchievementController.manualAchievements.find(
            (achievement) => achievement.name === a.achievement,
        );
        return {
            ...a,
            data: a.data as DataType,
            description: achievement?.description[0] ?? "",
        };
    });
});
