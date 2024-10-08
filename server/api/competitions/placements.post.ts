import { AuthController } from "~/server/controller/AuthController";
import { CompetitionPlacement } from "~/server/model/Competition";
import type { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody<ICompetitionPlacement[]>(event);
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
    if (body.length <= 0) {
        return;
    }

    const competitions = new Set<string>();
    for (const placement of body) {
        competitions.add(placement.competition);
    }
    if (competitions.size > 1) {
        throw createError({
            statusCode: 400,
            statusMessage:
                "Cannot update placements of more than one competition at a time",
        });
    }

    let existingPlacements = await CompetitionPlacement.findBy({
        competition: body[0].competition,
    });
    for (const placement of body) {
        existingPlacements = existingPlacements.filter((p) => {
            return (
                p.bracket !== placement.bracket || p.player !== placement.player
            );
        });
        const dbPlacement = new CompetitionPlacement();
        Object.assign(dbPlacement, placement);
        await dbPlacement.save();
    }

    for (const placementToDelete of existingPlacements) {
        await placementToDelete.remove();
    }
});
