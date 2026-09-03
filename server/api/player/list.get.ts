import { And, IsNull, Not } from "typeorm";
import { AuthController } from "~~/server/controller/AuthController";
import { Player } from "~~/server/model/Player";

export default defineEventHandler<
    Promise<
        | Pick<IPlayer, "primaryName">[]
        | Pick<
              IPlayer,
              | "uuid"
              | "primaryName"
              | "defaultAccolade"
              | "nationality"
              | "accolade"
          >[]
    >
>(async (event) => {
    const query = getQuery(event);
    const session = await AuthController.useSession(event);

    if (
        query.full !== undefined &&
        (await AuthController.isAuthenticated(session.data.discordId, [
            IPermission.BACKEND_ACCESS,
        ]))
    ) {
        const rawPlayers = await Player.find({
            select: {
                uuid: true,
                primaryName: true,
                accolade: true,
                defaultAccolade: true,
                nationality: true,
            },
        });

        return rawPlayers;
    }

    const rawPlayers = await Player.find({
        select: {
            primaryName: true,
        },
        where: {
            excludedFromSearch: Not(And(Not(false), Not(IsNull()))),
        },
    });

    return rawPlayers;
});
