import { AuthController } from "~/server/controller/AuthController";
import { CompetitionPlacement } from "~/server/model/Competition";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
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

    if (query.tag === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "competition tag query must be set",
        });
    }

    const placements = await CompetitionPlacement.findBy({
        competition: query.tag as string,
    });

    return placements;
});
