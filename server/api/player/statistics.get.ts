import PlayerStatisticController from "~/server/controller/PlayerStatisticController";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    if (query.player == null) {
        throw createError({
            statusCode: 400,
            message: "player is required",
        });
    }

    if ((await Player.countBy({ uuid: query.player as string })) <= 0) {
        throw createError({
            statusCode: 404,
            message: "unknown player",
        });
    }
    const uuid = query.player as string;

    const statistics = await PlayerStatisticController.get(uuid);

    return statistics;
});
