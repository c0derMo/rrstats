import AchievementController from "~/server/controller/AchievementController";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        player: string;
        achievement: string;
        video: string;
        notes?: string;
    }>(event);

    if (body.player == null || body.achievement == null || body.video == null) {
        throw createError({ statusCode: 400 });
    }

    const player = await Player.countBy({ uuid: body.player });
    if (player <= 0) {
        throw createError({ statusCode: 404 });
    }

    const success = await AchievementController.submitManualAchievement(
        body.player,
        body.achievement,
        body.video,
        body.notes,
    );
    if (!success) {
        throw createError({ statusCode: 404 });
    }

    return null;
});
