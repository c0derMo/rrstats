import { AuthController } from "~~/server/controller/AuthController";
import { User } from "~~/server/model/User";

export default defineEventHandler<Promise<IUser>>(async (event) => {
    const session = await AuthController.useSession(event);

    if (session.data.discordId == null) {
        throw createError({
            statusCode: 403,
        });
    }

    const user = await User.findOneBy({
        authorizationKey: session.data.discordId,
        isAPIKey: false,
    });

    if (user != null) {
        return user;
    } else {
        return {
            username: session.data.username ?? "",
            authorizationKey: session.data.discordId,
            isAPIKey: false,
            permissions: [],
        };
    }
});
