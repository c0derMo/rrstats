import { AuthController } from "~~/server/controller/AuthController";
import DatabaseCheckController, {
    type CheckResult,
} from "~~/server/controller/DatabaseCheckController";
import consola from "consola";

export default defineEventHandler<Promise<CheckResult[]>>(async (event) => {
    const body = await readBody<{
        checks?: string[];
        ignoredCompetitions?: string[];
        knownIssues?: string;
    }>(event);
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
            body.checks,
            body.ignoredCompetitions ?? [],
            body.knownIssues ?? "",
        );
    } catch (e) {
        consola.error(e);
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
