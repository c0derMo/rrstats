import { AuthController } from "~~/server/controller/AuthController";
import { User } from "~~/server/model/User";

export default defineEventHandler<Promise<IUser[]>>(async (event) => {
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_USERS,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    return await User.find();
});
