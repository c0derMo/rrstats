import { AuthController } from "~~/server/controller/AuthController";
import { Bracket } from "~~/server/model/Bracket";

export default defineEventHandler(async (event) => {
    const body = await readBody<IBracket[]>(event);
    const query = getQuery<{ tag: string }>(event);
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
    if (query.tag == null || query.tag === "") {
        throw createError({
            statusCode: 400,
            message: "Competition tag must be set",
        });
    }

    let existingBrackets = await Bracket.find({
        where: {
            competition: query.tag,
        },
        select: ["index", "competition"],
    });
    for (const bracket of body) {
        existingBrackets = existingBrackets.filter(
            (existingBracket) => existingBracket.index !== bracket.index,
        );
        const dbBracket = new Bracket();
        Object.assign(dbBracket, bracket);
        await dbBracket.save();
    }
    for (const bracketToDelete of existingBrackets) {
        await bracketToDelete.remove();
    }
});
