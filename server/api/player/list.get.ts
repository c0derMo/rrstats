import { IsNull } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = await AuthController.useSession(event);

    if (
        query.full !== undefined &&
        (await AuthController.isAuthenticated(session.data.discordId))
    ) {
        const rawPlayers = await Player.find({
            select: ["uuid", "primaryName", "title", "nationality"],
        });

        return rawPlayers;
    }

    const rawPlayers = await Player.find({
        select: ["primaryName"],
        where: [
            { excludedFromSearch: false },
            { excludedFromSearch: IsNull() },
        ],
    });

    return rawPlayers.map((p) => p.primaryName);
});
