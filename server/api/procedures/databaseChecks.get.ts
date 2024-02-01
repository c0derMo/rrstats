import { AuthController } from "~/server/controller/AuthController";
import DatabaseCheckController from "~/server/controller/DatabaseCheckController";

export default defineEventHandler(async (event) => {
    if (!(await AuthController.isAuthenticated(event.context.session.user))) {
        throw createError({
            statusCode: 403,
        });
    }

    return DatabaseCheckController.getChecks();
});
