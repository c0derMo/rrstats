import { DataSource, LessThanOrEqual } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";

const COMP = "RR16";
const BEFORE = 1740956400000;
const PREFIX = "Swiss ";

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats_actual.db",
        entities: [Match, PlayedMap],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        where: {
            competition: COMP,
            timestamp: LessThanOrEqual(BEFORE),
        },
        relations: {
            playedMaps: false,
        },
    });
    console.log(`Loaded ${matches.length} matches.`);

    for (const match of matches) {
        match.round = PREFIX + match.round;
        await match.save();
    }

    await dataSource.destroy();
}

void main();
