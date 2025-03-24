import { AuthController } from "~/server/controller/AuthController";
import { Achievement } from "~/server/model/Achievement";
import type { SubmittedAchievement } from "~/utils/interfaces/AchievementInfo";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody<SubmittedAchievement>(event);
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

    const achievement = new Achievement();
    Object.assign(achievement, body);
    await achievement.save();
});
