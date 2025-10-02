import { AuthController } from "~~/server/controller/AuthController";
import { User } from "~~/server/model/User";

export default defineEventHandler<Promise<IUser>>(async (event) => {
    const session = await AuthController.useSession(event);

    if (session.data.discordId == null) {
        throw createError({
            statusCode: 403,
        });
    }

    const user = await User.findOneByOrFail({
        authorizationKey: session.data.discordId,
    });

    return user;
});
