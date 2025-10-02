import { AuthController } from "~~/server/controller/AuthController";
import { Competition } from "~~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const body = await readBody<ICompetition>(event);
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

    const competition = new Competition();
    Object.assign(competition, body);
    await competition.save();
});
