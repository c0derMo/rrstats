import { In } from "typeorm";
import { AuthController } from "~/server/controller/AuthController";
import { User } from "~/server/model/User";
import { IPermission, IUser } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    if (!(await AuthController.isAuthenticated(event.context.session.user, IPermission.EDIT_USERS))) {
        throw createError({
            statusCode: 403
        });
    }

    const allUserAuths = (await User.find({ select: ['authorizationKey'] })).map(u => u.authorizationKey);
    const newUsers = await readBody(event) as IUser[];

    for (const newUser of newUsers) {
        let dbUser: User;
        if (allUserAuths.includes(newUser.authorizationKey)) {
            dbUser = await User.findOneByOrFail({ authorizationKey: newUser.authorizationKey });
            allUserAuths.splice(allUserAuths.findIndex(a => a === dbUser.authorizationKey), 1);
        } else {
            dbUser = new User();
        }
        Object.assign(dbUser, newUser);
        await dbUser.save();
    }

    await User.delete({ authorizationKey: In(allUserAuths) });
});