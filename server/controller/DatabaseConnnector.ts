import "reflect-metadata";
import {
    DataSource,
    type DataSourceOptions,
    type EntityManager,
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

const logger = consola.withTag("rrstats:database");

export default class DatabaseConnector {
    private db: DataSource;

    constructor(dbType: string, database: string, withSubscribers = true) {
        if (dbType !== "sqlite" && dbType !== "postgres") {
            throw new Error(`Illegal database type: ${dbType}`);
        }

        this.db = new DataSource({
            type: dbType,
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
            ],
            subscribers: withSubscribers
                ? [
                      PlayerAccoladeSubscriber,
                      LeaderboardDatabaseListener,
                      PlayerStatisticDatabaseListener,
                  ]
                : undefined,
            synchronize: true,
            parseInt8: dbType === "postgres" ? true : undefined,
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
