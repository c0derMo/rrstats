import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody<Partial<IPlayer>>(event);
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_COMPETITIONS,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (body.uuid === "") {
        delete body.uuid;
    }

    const player = new Player();
    Object.assign(player, body);
    await player.save();
});
