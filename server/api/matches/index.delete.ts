import { AuthController } from "~~/server/controller/AuthController";
import { Match } from "~~/server/model/Match";
import { PlayedMap } from "~~/server/model/PlayedMap";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        uuid?: string;
    }>(event);
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

    if (body.uuid == null) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain match uuid",
        });
    }

    const matchToRemove = await Match.findOneBy({
        uuid: body.uuid,
    });
    if (matchToRemove != null) {
        await PlayedMap.delete({
            match: matchToRemove,
        });
        await Match.delete({
            uuid: body.uuid,
        });
    }
});
