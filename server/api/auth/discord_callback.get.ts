import { AuthController } from "~/server/controller/AuthController";
import DiscordAuthIntegration from "~/server/controller/integrations/DiscordAuthIntegration";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const session = await AuthController.useSession(event);

    const user = await DiscordAuthIntegration.handleLogin(
        session.id ?? "",
        query.code as string,
        query.state as string,
    );

    if (user == null) {
        throw createError({
            statusCode: 403,
        });
    }

    await session.update({
        discordId: user.authorizationKey
    });

    await sendRedirect(event, "/backend");
});
