import "reflect-metadata";
import LeaderboardController from "./controller/LeaderboardController";
import DatabaseConnector from "./controller/DatabaseConnnector";
import { setFunctionTimersEnabled } from "~/utils/FunctionTimer";

export default defineNitroPlugin(async (nitroApp) => {
    const config = useRuntimeConfig();
    setFunctionTimersEnabled(config.enableFunctionTimings);

    const database = new DatabaseConnector(
        config.databaseType,
        config.database,
    );

    await database.initialize();
    await LeaderboardController.recalculate();

    nitroApp.hooks.hook("close", async () => {
        if (database.isInitialized()) {
            await database.destroy();
        }
    });
});
