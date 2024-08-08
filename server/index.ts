import "reflect-metadata";
import { DataSource } from "typeorm";
import { Match } from "./model/Match";
import { Player, PlayerAccoladeSubscriber } from "./model/Player";
import { GenericRecord, MapRecord } from "./model/Record";
import { Competition, CompetitionPlacement } from "./model/Competition";
import { User } from "./model/User";
import LeaderboardController, {
    LeaderboardDatabaseListener,
} from "./controller/LeaderboardController";
import { PlayerStatisticDatabaseListener } from "./controller/PlayerStatisticController";

export default defineNitroPlugin(async (nitroApp) => {
    console.log("Connecting to database");

    const db = new DataSource({
        type: "sqlite",
        database: useRuntimeConfig().database,
        entities: [
            Match,
            Player,
            GenericRecord,
            MapRecord,
            Competition,
            CompetitionPlacement,
            User,
        ],
        subscribers: [
            PlayerAccoladeSubscriber,
            LeaderboardDatabaseListener,
            PlayerStatisticDatabaseListener,
        ],
        synchronize: true,
    });
    await db.initialize();
    console.log("Connected to database.");

    await LeaderboardController.recalculate();
    console.log("Recalculated leaderboards");

    nitroApp.hooks.hook("close", async () => {
        if (db.isInitialized) {
            console.log("Closing database connection");
            await db.destroy();
        }
    });
});
