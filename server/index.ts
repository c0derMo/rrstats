import "reflect-metadata";
import { DataSource } from "typeorm";
import { Match } from "./model/Match";
import { Player, PlayerSubscriber } from "./model/Player";
import { useLogger } from "@nuxt/kit";
import { GenericRecord, MapRecord } from "./model/Record";
import { Competition, CompetitionPlacement } from "./model/Competition";

const logger = useLogger("rrstats:database");

export default defineNitroPlugin((nitroApp) => {
    logger.info("Connecting to database");

    const db = new DataSource({
        type: "sqlite",
        database: "dev.db",
        entities: [
            Match,
            Player,
            GenericRecord,
            MapRecord,
            Competition,
            CompetitionPlacement,
        ],
        subscribers: [PlayerSubscriber],
        synchronize: true,
    });
    db.initialize();
    logger.info("Connected to database.");

    nitroApp.hooks.hook("close", async () => {
        if (db.isInitialized) {
            logger.info("Closing database connection");
            await db.destroy();
        }
    });
});
