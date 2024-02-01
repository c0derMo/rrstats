import { AuthController } from "~/server/controller/AuthController";
import { Player } from "~/server/model/Player";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (
        !(await AuthController.isAuthenticated(
            event.context.session.user,
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
