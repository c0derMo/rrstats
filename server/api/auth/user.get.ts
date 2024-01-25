import { User } from "~/server/model/User";

export default defineEventHandler(async (event) => {
    if (event.context.session.user == null) {
        throw createError({
            statusCode: 403,
        });
    }

    const user = await User.findOneByOrFail({
        authorizationKey: event.context.session.user,
    });

    return user;
});
