import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_MATCHES,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (body.uuid === "") {
        delete body.uuid;
    }

    const match = new Match();
    Object.assign(match, body);
    await match.save();
});
