import "reflect-metadata";
import LeaderboardController from "./controller/LeaderboardController";
import DatabaseConnector from "./controller/DatabaseConnnector";
import { setFunctionTimersEnabled } from "~/utils/FunctionTimer";
import { VERSION } from "./version";
import EloController from "./controller/EloController";
import AchievementController from "./controller/AchievementController";
import NotificationController from "./controller/NotificationController";

let fullyInitialized = false;

export function isReady() {
    return fullyInitialized;
}

export default defineNitroPlugin(async (nitroApp) => {
    console.log(`Starting rrstats with commit hash ${VERSION}`);

    const config = useRuntimeConfig();
    setFunctionTimersEnabled(config.enableFunctionTimings);

    const database = new DatabaseConnector(
        config.databaseType,
        config.database,
    );

    await database.initialize();
    await EloController.getInstance().fetchCompetitions();
    await EloController.getInstance().recalculateAllElos();
    await LeaderboardController.recalculate();
    await AchievementController.recalculateAllAchievements();
    NotificationController.initialize();

    fullyInitialized = true;

    nitroApp.hooks.hook("close", async () => {
        if (database.isInitialized()) {
            await database.destroy();
        }
    });
});
