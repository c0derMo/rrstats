import { AuthController } from "~/server/controller/AuthController";
import { Achievement } from "~/server/model/Achievement";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
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

    return unverifiedAchievements;
});
