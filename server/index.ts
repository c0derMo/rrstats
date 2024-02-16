import "reflect-metadata";
import { DataSource } from "typeorm";
import { Match } from "./model/Match";
import { Player, PlayerAccoladeSubscriber } from "./model/Player";
import { useLogger } from "@nuxt/kit";
import { GenericRecord, MapRecord } from "./model/Record";
import { Competition, CompetitionPlacement } from "./model/Competition";
import { User } from "./model/User";
import LeaderboardController, { LeaderboardDatabaseListener } from "./controller/LeaderboardController";

const logger = useLogger("rrstats:database");

export default defineNitroPlugin(async (nitroApp) => {
    logger.info("Connecting to database");

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
        subscribers: [PlayerAccoladeSubscriber, LeaderboardDatabaseListener],
        synchronize: true,
    });
    await db.initialize();
    logger.info("Connected to database.");

    await LeaderboardController.recalculate();
    useLogger("rrstats:leaderboards").log("Recalculated leaderboards");

    nitroApp.hooks.hook("close", async () => {
        if (db.isInitialized) {
            logger.info("Closing database connection");
            await db.destroy();
        }
    });
});
