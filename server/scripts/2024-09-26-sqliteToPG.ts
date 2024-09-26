import consola from "consola";
import DatabaseConnector from "../controller/DatabaseConnnector";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { PlayedMap } from "../model/PlayedMap";
import { Match } from "../model/Match";
import { Player } from "../model/Player";
import { GenericRecord, MapRecord } from "../model/Record";
import { User } from "../model/User";

async function main() {
    consola.box(
        "This script pushes the contents of an SQLite database file to a postgres database using TypeORM.",
    );
    consola.log(
        "This can cause unintended side effects or data loss if handled incorrectly. Please handle with care!",
    );

    let sqliteDatasource: DatabaseConnector | null = null;
    while (sqliteDatasource == null) {
        const dbName = await consola.prompt(
            "Please enter the path to the sqlite database: ",
            { type: "text" },
        );

        sqliteDatasource = new DatabaseConnector("sqlite", dbName, false);
        try {
            await sqliteDatasource.initialize();
            consola.success("Connected to sqlite datasource.");
        } catch (e) {
            consola.error(e);
            consola.error(
                "Could not connect to the sqlite database. Please try again.",
            );
            sqliteDatasource = null;
        }
    }

    let pgDatasource: DatabaseConnector | null = null;
    while (pgDatasource == null) {
        const host = await consola.prompt(
            "Please enter the postgres server host:",
            { type: "text" },
        );
        const port = await consola.prompt(
            "Please enter the postgres server port:",
            { type: "text", default: "5432", hint: "Default is 5432" },
        );
        const user = await consola.prompt("Please enter the postgres user:", {
            type: "text",
        });
        const pass = await consola.prompt(
            "Please enter the postgres password:",
            { type: "text" },
        );
        const db = await consola.prompt("Please enter the postgres database:", {
            type: "text",
        });

        const pgUrl = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
        if (
            await consola.prompt(`Is this connection url correct? ${pgUrl}`, {
                type: "confirm",
            })
        ) {
            pgDatasource = new DatabaseConnector("postgres", pgUrl, false);
            try {
                await pgDatasource.initialize();
                consola.success("Connected to postgres database.");
            } catch (e) {
                consola.error(e);
                consola.error(
                    "Could not connect to the postgres database. Please try again.",
                );
                pgDatasource = null;
            }
        }
    }

    consola.warn("Continuing will drop the postgres database.");
    if (
        !(await consola.prompt("Are you sure you want to continue?", {
            type: "confirm",
        }))
    ) {
        consola.log("Exiting.");
        return;
    }

    await pgDatasource.dropDatabase();
    await pgDatasource.synchronize();

    // Step 1: Competitions
    consola.start("Migrating competitions (1/8)...");
    const sqliteComps = await sqliteDatasource.getManager().find(Competition);
    await pgDatasource.getManager().save(sqliteComps);
    consola.success(
        `Successfully migrated ${sqliteComps.length} competitions.`,
    );

    // Step 2: Competition Placements
    consola.start("Migrating competition placements (2/8)...");
    const sqlitePlacements = await sqliteDatasource
        .getManager()
        .find(CompetitionPlacement);
    await pgDatasource.getManager().save(sqlitePlacements);
    consola.success(
        `Successfully migrated ${sqlitePlacements.length} competition placements.`,
    );

    // Step 3: Played maps
    consola.start("Migrating played maps (3/8)...");
    const sqliteMaps = await sqliteDatasource.getManager().find(PlayedMap);

    // Rounding numbers because kekw
    sqliteMaps.forEach((map) => {
        map.timeTaken =
            map.timeTaken <= 0 ? map.timeTaken : Math.round(map.timeTaken);
    });

    await pgDatasource.getManager().save(sqliteMaps, { chunk: 1000 });
    consola.success(`Successfully migrated ${sqliteMaps.length} played maps.`);

    // Step 4: Matches
    consola.start("Migrating matches (4/8)...");
    const sqliteMatches = await sqliteDatasource.getManager().find(Match);

    await pgDatasource.getManager().save(sqliteMatches);
    consola.success(`Successfully migrated ${sqliteMatches.length} matches.`);

    // Step 5: Players
    consola.start("Migrating players (5/8)...");
    const sqlitePlayers = await sqliteDatasource.getManager().find(Player);
    await pgDatasource.getManager().save(sqlitePlayers);
    consola.success(`Successfully migrated ${sqlitePlayers.length} players.`);

    // Step 6: Generic Records
    consola.start("Migrating generic records (6/8)...");
    const sqliteGenRecords = await sqliteDatasource
        .getManager()
        .find(GenericRecord);
    await pgDatasource.getManager().save(sqliteGenRecords);
    consola.success(
        `Successfully migrated ${sqliteGenRecords.length} generic records.`,
    );

    // Step 7: Map Records
    consola.start("Migrating map records (7/8)...");
    const sqliteMapRecords = await sqliteDatasource
        .getManager()
        .find(MapRecord);
    await pgDatasource.getManager().save(sqliteMapRecords);
    consola.success(
        `Successfully migrated ${sqliteMapRecords.length} map records.`,
    );

    // Step 8: Users
    consola.start("Migrating users (8/8)...");
    const sqliteUsers = await sqliteDatasource.getManager().find(User);
    await pgDatasource.getManager().save(sqliteUsers);
    consola.success(`Successfully migrated ${sqliteUsers.length} users.`);

    consola.success("Successfully transferred all entities.");
    await pgDatasource.destroy();
    await sqliteDatasource.destroy();
}

void main();
