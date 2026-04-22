import AchievementController from "~~/server/controller/AchievementController";
import { AuthController } from "~~/server/controller/AuthController";
import { Player } from "~~/server/model/Player";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        accolade: string;
        player: string;
    }>(event);
    const session = await AuthController.useSession(event);

    if (session.data.discordId == null) {
        throw createError({
            statusCode: 401,
        });
    }

    const player = await Player.findOneByOrFail({
        uuid: body.player,
    });

    if (
        session.data.discordId !== player.discordId &&
        !(await AuthController.isAuthenticated(session.data.discordId, [
            IPermission.BACKEND_ACCESS,
            IPermission.EDIT_PLAYERS,
        ]))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    const possibleAchievements = [
        ...AchievementController.automaticAchievements.map(
            (achievement) => achievement.name,
        ),
        ...AchievementController.manualAchievements.map(
            (achievement) => achievement.name,
        ),
        player.defaultAccolade,
    ];
    if (
        !possibleAchievements.includes(body.accolade) ||
        player.defaultAccolade === "Roulette Rookie"
    ) {
        throw createError({
            statusCode: 400,
            message: "Invalid accolade.",
        });
    }

    player.accolade = body.accolade;
    await player.save();
});
