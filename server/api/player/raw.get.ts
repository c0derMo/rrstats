import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = await AuthController.useSession(event);

    if (!(await AuthController.isAuthenticated(session.data.discordId))) {
        throw createError({
            statusCode: 403,
        });
    }

    if (query.player == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "Player must be set",
        });
    }

    const rawPlayer = await Player.findOneBy({ uuid: query.player as string });
    return rawPlayer;
});
