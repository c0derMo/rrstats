import PlayerStatisticController from "~/server/controller/PlayerStatisticController";
import { Player } from "~/server/model/Player";
import type { IPlayerStatistics } from "~/utils/interfaces/IPlayer";

export default defineEventHandler<Promise<IPlayerStatistics>>(async (event) => {
    const query = getQuery<{
        player?: string;
        opponent?: string;
    }>(event);

    if (query.player == null) {
        throw createError({
            statusCode: 400,
            message: "player is required",
        });
    }

    if ((await Player.countBy({ uuid: query.player })) <= 0) {
        throw createError({
            statusCode: 404,
            message: "unknown player",
        });
    }

    let opponent = query.opponent;
    if (opponent != null && (await Player.countBy({ uuid: opponent })) <= 0) {
        opponent = undefined;
    }

    const statistics = await PlayerStatisticController.get(
        query.player,
        opponent,
    );

    return statistics;
});
