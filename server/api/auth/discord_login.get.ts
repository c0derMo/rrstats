import DiscordAuthIntegration from "~/server/controller/integrations/DiscordAuthIntegration";

export default defineEventHandler(async (event) => {
    const redirectUri = DiscordAuthIntegration.getLoginURI(
        event.context.session.id,
    );
    await sendRedirect(event, redirectUri);
});
