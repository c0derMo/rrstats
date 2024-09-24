import { AuthController } from "~/server/controller/AuthController";
import TwitterIntegration from "~/server/controller/integrations/TwitterIntegration";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler<Promise<boolean>>(async (event) => {
    const tweets = await readBody<string[]>(event);
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.TWEET,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (tweets == null || !Array.isArray(tweets)) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain tweets array",
        });
    }

    try {
        await TwitterIntegration.tweet(tweets);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
});
