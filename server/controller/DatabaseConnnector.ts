import "reflect-metadata";
import {
    DataSource,
    EventSubscriber,
    type DataSourceOptions,
    type EntityManager,
    type EntitySubscriberInterface,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
import { GenericRecord, MapRecord } from "../model/Record";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { PlayedMap } from "../model/PlayedMap";
import { Player, PlayerAccoladeSubscriber } from "../model/Player";
import { LeaderboardDatabaseListener } from "./LeaderboardController";
import { PlayerStatisticDatabaseListener } from "./PlayerStatisticController";
import { Match } from "../model/Match";
import { User } from "../model/User";
import consola from "consola";
import { EloDatabaseListener } from "./EloController";
import { Achievement } from "../model/Achievement";
import {
    AchievementDatabaseListener,
    AchievementVerifyListener,
} from "./AchievementController";

const logger = consola.withTag("rrstats:database");

export default class DatabaseConnector {
    private db: DataSource;

    constructor(dbType: string, database: string, withSubscribers = true) {
        if (dbType !== "sqlite" && dbType !== "postgres") {
            throw new Error(`Illegal database type: ${dbType}`);
        }

        this.db = new DataSource({
            type: dbType === "sqlite" ? "better-sqlite3" : dbType,
            database: dbType === "sqlite" ? database : undefined,
            url: dbType === "postgres" ? database : undefined,
            entities: [
                Match,
                Player,
                GenericRecord,
                MapRecord,
                Competition,
                CompetitionPlacement,
                User,
                PlayedMap,
                Achievement,
            ],
            subscribers: withSubscribers
                ? [
                      PlayerAccoladeSubscriber,
                      LeaderboardDatabaseListener,
                      PlayerStatisticDatabaseListener,
                      EloDatabaseListener,
                      AchievementDatabaseListener,
                      AchievementVerifyListener,
                      DatabaseInsertUpdateLogger,
                  ]
                : undefined,
            synchronize: true,
            parseInt8: dbType === "postgres" ? true : undefined,
            prepareDatabase:
                dbType !== "sqlite"
                    ? undefined
                    : (db) => {
                          logger.debug("Setting journal mode");
                          db.pragma("journal_mode = WAL");
                      },
            poolSize: dbType === "postgres" ? 20 : undefined,
        } as DataSourceOptions);
    }

    async initialize() {
        if (this.db.isInitialized) {
            logger.warn(
                "Database initialize called even though database is already initialized",
            );
            return;
        }
        logger.start(
            `Connecting to ${this.db.options.type} ${this.db.options.database} database`,
        );
        await this.db.initialize();
        logger.ready("Connected to database.");
    }

    isInitialized(): boolean {
        return this.db.isInitialized;
    }

    async destroy() {
        logger.start("Closing database connection");
        await this.db.destroy();
        logger.success("Database connection closed");
    }

    async dropDatabase() {
        await this.db.dropDatabase();
        logger.success("Dropped database");
    }

    async synchronize() {
        await this.db.synchronize();
        logger.success("Synchronized database");
    }

    getManager(): EntityManager {
        return this.db.manager;
    }
}

@EventSubscriber()
class DatabaseInsertUpdateLogger implements EntitySubscriberInterface {
    private readonly LOGGING_LEVEL =
        DatabaseInsertUpdateLogger.getLoggingLevel();

    afterInsert(event: InsertEvent<unknown>): void {
        switch (this.LOGGING_LEVEL) {
            case "full":
                logger.log(
                    `INSERT: ${event.metadata.tableName} (${JSON.stringify(event.entity)})`,
                );
                break;
            case "event":
                logger.log(`INSERT: ${event.metadata.tableName}`);
                break;
            case "none":
                break;
        }
    }
    afterUpdate(event: UpdateEvent<unknown>): void {
        switch (this.LOGGING_LEVEL) {
            case "full":
                logger.log(
                    `UPDATE: ${event.metadata.tableName} (${JSON.stringify(event.entity)})`,
                );
                break;
            case "event":
                logger.log(`UPDATE: ${event.metadata.tableName}`);
                break;
            case "none":
                break;
        }
    }

    private static getLoggingLevel(): "full" | "event" | "none" {
        if (
            ["full", "event", "none"].includes(
                useRuntimeConfig().databaseLogging,
            )
        ) {
            return useRuntimeConfig().databaseLogging as
                | "full"
                | "event"
                | "none";
        }
        if (import.meta.dev) {
            return "event";
        }
        return "none";
    }
}
