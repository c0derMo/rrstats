import { AuthController } from "~~/server/controller/AuthController";
import { Achievement } from "~~/server/model/Achievement";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        player?: string;
        achievement?: string;
    }>(event);
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

    if (body.player == null || body.achievement == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain player and achievement",
        });
    }

    await Achievement.delete({
        player: body.player,
        achievement: body.achievement,
    });
});
