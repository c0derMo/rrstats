import { AuthController } from "~~/server/controller/AuthController";
import { Competition, CompetitionPlacement } from "~~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        tag?: string;
    }>(event);
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

    if (body.tag == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain competition tag",
        });
    }

    const compToRemove = await Competition.findOneBy({
        tag: body.tag,
    });
    if (compToRemove != null) {
        await compToRemove.remove();
        await CompetitionPlacement.delete({ competition: body.tag });
    }
});
