import { AuthController } from "~~/server/controller/AuthController";
import DiscordAuthIntegration from "~~/server/controller/integrations/DiscordAuthIntegration";

export default defineEventHandler(async (event) => {
    const session = await AuthController.useSession(event);
    const query = getQuery(event);

    await session.update({
        postLoginRedirect: (query.to as string) ?? "/",
    });

    const redirectUri = DiscordAuthIntegration.getLoginURI(session.id ?? "");
    await sendRedirect(event, redirectUri);
});
