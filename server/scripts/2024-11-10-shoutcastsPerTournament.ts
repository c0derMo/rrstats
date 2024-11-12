import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";

const compToExport = "RR15";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, PlayedMap],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        where: { competition: compToExport },
        relations: {
            playedMaps: false
        }
    });
    console.log(`Loaded ${matches.length} matches.`);

    const shoutcasters: Record<string, number> = {};
    for (const match of matches) {
        if (match.shoutcasters == null || match.shoutcasters.length <= 0) {
            continue;
        }
        for (const caster of match.shoutcasters) {
            if (shoutcasters[caster] == null) {
                shoutcasters[caster] = 0;
            }
            shoutcasters[caster] += 1;
        }
    }

    console.log("====")
    console.log("Stats:")

    for (const caster in shoutcasters) {
        console.log(`${caster}:    ${shoutcasters[caster]}`);
    }
}

void main();
