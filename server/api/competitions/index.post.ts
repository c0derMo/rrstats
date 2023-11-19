import { AuthController } from "~/server/controller/AuthController";
import { Competition } from "~/server/model/Competition";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!await AuthController.isAuthenticated(event.context.session.user, IPermission.EDIT_COMPETITIONS)) {
        throw createError({
            statusCode: 403,
        });
    }

    const competition = new Competition();
    Object.assign(competition, body);
    await competition.save();
});
