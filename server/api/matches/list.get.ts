import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
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

    const matches = await Match.find();

    return matches;
});
