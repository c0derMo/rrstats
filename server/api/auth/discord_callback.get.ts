import DiscordAuthIntegration from "~/server/controller/integrations/DiscordAuthIntegration";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const user = await DiscordAuthIntegration.handleLogin(
        event.context.session.id,
        query.code as string,
        query.state as string,
    );

    if (user == null) {
        throw createError({
            statusCode: 403,
        });
    }

    event.context.session.user = user.authorizationKey;

    await sendRedirect(event, "/backend");
});