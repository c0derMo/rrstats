import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (
        !(await AuthController.isAuthenticated(
            event.context.session.user,
            IPermission.EDIT_MATCHES,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (body.uuid == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain match uuid",
        });
    }

    const matchToRemove = await Match.findOneBy({
        uuid: body.uuid as string,
    });
    if (matchToRemove != null) {
        await matchToRemove.remove();
    }
});
