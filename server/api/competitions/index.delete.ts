import { AuthController } from "~/server/controller/AuthController";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
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

    if (body.tag == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain competition tag",
        });
    }

    const compToRemove = await Competition.findOneBy({
        tag: body.tag as string,
    });
    if (compToRemove != null) {
        await compToRemove.remove();
        await CompetitionPlacement.delete({ competition: body.tag as string });
    }
});
