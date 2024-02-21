import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = await AuthController.useSession(event);

    if (!(await AuthController.isAuthenticated(session.data.discordId))) {
        throw createError({
            statusCode: 403,
        });
    }
    if (query.player === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "player must be set",
        });
    }

    const matches = await Match.find({
        where: [
            { playerOne: query.player as string },
            { playerTwo: query.player as string },
        ],
        select: [
            "uuid",
            "competition",
            "playerOne",
            "playerTwo",
            "playedMaps",
            "round",
            "platform",
            "playerOneScore",
            "playerTwoScore",
        ],
        order: { timestamp: "DESC" },
    });

    return matches;
});
