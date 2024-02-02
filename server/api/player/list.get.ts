import { IsNull } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (
        query.full !== undefined &&
        (await AuthController.isAuthenticated(event.context.session.user))
    ) {
        const rawPlayers = await Player.find({
            select: ["uuid", "primaryName", "title"],
        });

        return rawPlayers;
    }

    const rawPlayers = await Player.find({ select: ["primaryName"], where: [{ excludedFromSearch: false }, { excludedFromSearch: IsNull() }] });

    return rawPlayers.map((p) => p.primaryName);
});
