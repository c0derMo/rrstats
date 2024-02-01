import { AuthController } from "~/server/controller/AuthController";
import DatabaseCheckController from "~/server/controller/DatabaseCheckController";

export default defineEventHandler(async (event) => {
    const checks = await readBody(event);

    if (
        !(await AuthController.isAuthenticated(
            event.context.session.user
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (checks == null || !Array.isArray(checks)) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain checks array"
        });
    }

    try {
        return await DatabaseCheckController.runChecks(checks as string[]);
    } catch (e) {
        console.log(e);
        return [{name: 'Checks failed', errors: ['Checks failed with exception. See console for more info.'], issues: []}];
    }
});