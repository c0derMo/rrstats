import { AuthController } from "~/server/controller/AuthController";
import DatabaseCheckController from "~/server/controller/DatabaseCheckController";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const session = await AuthController.useSession(event);

    if (!(await AuthController.isAuthenticated(session.data.discordId))) {
        throw createError({
            statusCode: 403,
        });
    }

    if (body.checks == null || !Array.isArray(body.checks)) {
        throw createError({
            statusCode: 400,
            statusMessage: "body must contain checks array",
        });
    }

    try {
        return await DatabaseCheckController.runChecks(
            body.checks as string[],
            (body.ignoredCompetitions as string[]) ?? [],
            (body.knownIssues as string) ?? "",
        );
    } catch (e) {
        console.log(e);
        return [
            {
                name: "Checks failed",
                errors: [
                    "Checks failed with exception. See console for more info.",
                ],
                issues: [],
            },
        ];
    }
});
