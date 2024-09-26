import { AuthController } from "~/server/controller/AuthController";
import DatabaseCheckController, {
    type CheckInfo,
} from "~/server/controller/DatabaseCheckController";

export default defineEventHandler<Promise<CheckInfo[]>>(async (event) => {
    const session = await AuthController.useSession(event);

    if (!(await AuthController.isAuthenticated(session.data.discordId))) {
        throw createError({
            statusCode: 403,
        });
    }

    return DatabaseCheckController.getChecks();
});
