import { AuthController } from "~/server/controller/AuthController";
import { CompetitionPlacement } from "~/server/model/Competition";
import { Player } from "~/server/model/Player";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        uuid?: string;
    }>(event);
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_PLAYERS,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (body.uuid == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain player uuid",
        });
    }

    const playerToRemove = await Player.findOneBy({
        uuid: body.uuid,
    });
    if (playerToRemove != null) {
        await playerToRemove.remove();
        await CompetitionPlacement.delete({ player: body.uuid });
    }
});
