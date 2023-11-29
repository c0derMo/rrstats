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

    const rawPlayers = await Player.find({ select: ["primaryName"] });

    return rawPlayers.map((p) => p.primaryName);
});
