import AchievementController from "~/server/controller/AchievementController";
import { Player } from "~/server/model/Player";
import type { AchievedAchievement } from "~/utils/interfaces/AchievementInfo";

export default defineEventHandler<Promise<AchievedAchievement[]>>(
    async (event) => {
        const query = getQuery<{
            player: string;
        }>(event);

        if (
            query.player == null ||
            (await Player.countBy({ uuid: query.player })) <= 0
        ) {
            throw createError({ statusCode: 404 });
        }

        return await AchievementController.getAchievementsOfPlayer(
            query.player,
        );
    },
);
