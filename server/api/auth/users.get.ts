import { AuthController } from "~/server/controller/AuthController"
import { User } from "~/server/model/User";
import { IPermission } from "~/utils/interfaces/IUser"

export default defineEventHandler(async (event) => {
    if (!(await AuthController.isAuthenticated(event.context.session.user, IPermission.EDIT_USERS))) {
        throw createError({
            statusCode: 403
        });
    }

    return await User.find();
})