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

    const match = new Match();
    Object.assign(match, body);
    await match.save();
});
