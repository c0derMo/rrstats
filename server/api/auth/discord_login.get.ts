import { AuthController } from "~/server/controller/AuthController";
import DiscordAuthIntegration from "~/server/controller/integrations/DiscordAuthIntegration";

export default defineEventHandler(async (event) => {
    const session = await AuthController.useSession(event);

    const redirectUri = DiscordAuthIntegration.getLoginURI(session.id ?? "");
    await sendRedirect(event, redirectUri);
});
