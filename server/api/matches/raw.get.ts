import { AuthController } from "~/server/controller/AuthController";
import { Match } from "~/server/model/Match";
import type { IMatch } from "~/utils/interfaces/IMatch";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler<Promise<IMatch[]>>(async (event) => {
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

    const matches = await Match.find({
        order: { timestamp: "DESC" },
    });

    return matches;
});
