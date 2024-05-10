import { AuthController } from "~/server/controller/AuthController";
import { User } from "~/server/model/User";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
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
