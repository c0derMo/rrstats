import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats_actual.db",
        entities: [Match, PlayedMap],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const maps = await PlayedMap.find();
    console.log(`Loaded ${maps.length} maps.`);

    let edited = 0;
    for (const map of maps) {
        if (map.timeTaken % 1 !== 0) {
            edited += 1;
            map.timeTaken = Math.floor(map.timeTaken);
            await map.save();
        }
    }
    console.log(`Edited ${edited} maps.`);

    await dataSource.destroy();
}

void main();
