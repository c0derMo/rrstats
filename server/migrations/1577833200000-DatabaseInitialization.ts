import {
    type MigrationInterface,
    type QueryRunner,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class DatabaseInitialization1577833200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS achievement
            (
                player            TEXT    NOT NULL,
                achievement       TEXT    NOT NULL,
                achievedAt        TEXT    NOT NULL,
                progression       TEXT    NOT NULL,
                data              TEXT    NOT NULL,
                verified          BOOLEAN NOT NULL,
                progressionString TEXT,
                match             TEXT,
                PRIMARY KEY (player, achievement)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS competition
            (
                tag                 TEXT    NOT NULL
                    PRIMARY KEY,
                name                TEXT    NOT NULL,
                officialCompetition BOOLEAN NOT NULL,
                startingTimestamp   INT8    NOT NULL,
                hitmapsStatsUrl     TEXT,
                hitmapsSlug         TEXT,
                updateWithHitmaps   BOOLEAN,
                backgroundImage     TEXT,
                groupsConfig        TEXT,
                matchTimeoutTime    INT8    NOT NULL
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS competition_placement
            (
                player      TEXT NOT NULL,
                competition TEXT NOT NULL,
                bracket     TEXT NOT NULL,
                placement   INTEGER,
                PRIMARY KEY (player, competition, bracket)
            );  
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS generic_record
            (
                timestamp INT8    NOT NULL,
                record    TEXT    NOT NULL,
                players   TEXT    NOT NULL,
                time      INTEGER NOT NULL,
                match     TEXT    NOT NULL,
                maps      TEXT    NOT NULL,
                PRIMARY KEY (timestamp, record)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS map_record
            (
                timestamp INT8    NOT NULL,
                map       INTEGER NOT NULL,
                player    TEXT    NOT NULL,
                time      INTEGER NOT NULL,
                match     TEXT    NOT NULL,
                mapIndex  INTEGER NOT NULL,
                PRIMARY KEY (timestamp, map)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS match
            (
                uuid           VARCHAR           NOT NULL
                    PRIMARY KEY,
                hitmapsMatchId TEXT,
                timestamp      INT8              NOT NULL,
                playerOne      TEXT              NOT NULL,
                playerTwo      TEXT              NOT NULL,
                playerOneScore INTEGER           NOT NULL,
                playerTwoScore INTEGER           NOT NULL,
                competition    TEXT              NOT NULL,
                round          TEXT              NOT NULL,
                platform       TEXT,
                bannedMaps     TEXT              NOT NULL,
                shoutcasters   TEXT,
                vodLink        TEXT,
                annulated      BOOLEAN,
                notes          TEXT,
                eloChange      TEXT default '[]' NOT NULL
            );
        `);
        const matchTable = (await queryRunner.getTable("match"))!;
        if (
            matchTable.indices.find(
                (index) => index.columnNames[0] === "hitmapsMatchId",
            ) == null
        ) {
            await queryRunner.createIndex(
                "match",
                new TableIndex({
                    columnNames: ["hitmapsMatchId"],
                }),
            );
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS played_map
            (
                uuid      VARCHAR NOT NULL
                    PRIMARY KEY,
                map       INTEGER NOT NULL,
                picked    INTEGER NOT NULL,
                winner    INTEGER NOT NULL,
                "index"   INTEGER NOT NULL,
                forfeit   BOOLEAN,
                unscored  BOOLEAN,
                spin      TEXT,
                timeTaken INTEGER NOT NULL,
                notes     TEXT,
                matchUuid VARCHAR
            );  
        `);
        const playedMapTable = (await queryRunner.getTable("played_map"))!;
        if (
            playedMapTable.foreignKeys.find(
                (key) => key.columnNames[0] === "matchUuid",
            ) == null
        ) {
            await queryRunner.createForeignKey(
                "played_map",
                new TableForeignKey({
                    columnNames: ["matchUuid"],
                    referencedTableName: "match",
                    referencedColumnNames: ["uuid"],
                }),
            );
        }
        if (
            playedMapTable.indices.find(
                (index) => index.columnNames[0] === "map",
            ) == null
        ) {
            await queryRunner.createIndex(
                "played_map",
                new TableIndex({
                    columnNames: ["map"],
                }),
            );
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS player
            (
                uuid               VARCHAR NOT NULL
                    PRIMARY KEY,
                primaryName        TEXT    NOT NULL,
                alternativeNames   TEXT    NOT NULL,
                discordId          TEXT,
                title              TEXT,
                hasCustomTitle     BOOLEAN,
                excludedFromSearch BOOLEAN,
                nationality        TEXT
            );
        `);
        await queryRunner.getTable("player");
        const playerTable = (await queryRunner.getTable("player"))!;
        if (
            playerTable.indices.find(
                (index) => index.columnNames[0] === "excludedFromSearch",
            ) == null
        ) {
            await queryRunner.createIndex(
                "player",
                new TableIndex({
                    columnNames: ["excludedFromSearch"],
                }),
            );
        }
        if (
            playerTable.indices.find(
                (index) => index.columnNames[0] === "primaryName",
            ) == null
        ) {
            await queryRunner.createIndex(
                "player",
                new TableIndex({
                    columnNames: ["primaryName"],
                }),
            );
        }

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user"
            (
                authorizationKey TEXT    NOT NULL
                    PRIMARY KEY,
                username         TEXT    NOT NULL,
                isAPIKey         BOOLEAN NOT NULL,
                permissions      TEXT    NOT NULL
            );    
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("achievement", false, true, true);
        await queryRunner.dropTable("competition", false, true, true);
        await queryRunner.dropTable("competition_placement", false, true, true);
        await queryRunner.dropTable("generic_record", false, true, true);
        await queryRunner.dropTable("map_record", false, true, true);
        await queryRunner.dropTable("match", false, true, true);
        await queryRunner.dropTable("played_map", false, true, true);
        await queryRunner.dropTable("player", false, true, true);
        await queryRunner.dropTable("user", false, true, true);
    }
}
