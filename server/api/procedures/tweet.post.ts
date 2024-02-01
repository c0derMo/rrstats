import { AuthController } from "~/server/controller/AuthController";
import TwitterIntegration from "~/server/controller/integrations/TwitterIntegration";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const tweets = await readBody(event);

    if (
        !(await AuthController.isAuthenticated(
            event.context.session.user,
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
