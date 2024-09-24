import { Not } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";
import type { IPlayer } from "~/utils/interfaces/IPlayer";

export default defineEventHandler<
    Promise<
        | Pick<IPlayer, "primaryName">[]
        | Pick<IPlayer, "uuid" | "primaryName" | "title" | "nationality">[]
    >
>(async (event) => {
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
        where: { excludedFromSearch: Not(true) },
    });

    return rawPlayers;
});
