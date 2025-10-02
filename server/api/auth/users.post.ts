import { In } from "typeorm";
import { AuthController } from "~~/server/controller/AuthController";
import { User } from "~~/server/model/User";

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

    const allUserAuths = (
        await User.find({ select: ["authorizationKey"] })
    ).map((u) => u.authorizationKey);
    const newUsers = await readBody<IUser[]>(event);

    for (const newUser of newUsers) {
        let dbUser: User;
        if (allUserAuths.includes(newUser.authorizationKey)) {
            dbUser = await User.findOneByOrFail({
                authorizationKey: newUser.authorizationKey,
            });
            allUserAuths.splice(
                allUserAuths.findIndex((a) => a === dbUser.authorizationKey),
                1,
            );
        } else {
            dbUser = new User();
        }
        Object.assign(dbUser, newUser);
        await dbUser.save();
    }

    await User.delete({ authorizationKey: In(allUserAuths) });
});
