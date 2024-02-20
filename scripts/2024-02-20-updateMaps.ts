import { DateTime } from "luxon";
import { DataSource } from "typeorm";
import { Match } from "~/server/model/Match";
import { RRMap } from "~/utils/interfaces/IMatch";

interface OldRRMap extends RRMap {
    startedTimestamp?: number;
    endedTimestamp?: number;
    timeAccurate?: boolean;
}

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find();
    console.log(`${matches.length} matches loaded.`);

    let show = true;

    for (const match of matches) {
        for (const map of match.playedMaps as OldRRMap[]) {
            delete map['timeAccurate'];
            map.timeTaken = -1;
            if (map.startedTimestamp != null && map.startedTimestamp > 0) {
                const startingDateTime = DateTime.fromMillis(map.startedTimestamp);
                if (map.endedTimestamp != null && map.endedTimestamp > 0 && map.endedTimestamp > map.startedTimestamp) {
                    const endingDateTime = DateTime.fromMillis(map.endedTimestamp);
                    const spinTime = Math.abs(startingDateTime.diff(endingDateTime).as('seconds'));
                    map.timeTaken = spinTime;
                    console.log(`Converted timestamps to ${spinTime}`);
                }
            }
            delete map['startedTimestamp'];
            delete map['endedTimestamp'];
        }

        if (show) {
            console.log(match.playedMaps);
            show = false;
        }

        await match.save();
    }
    console.log(`${matches.length} matches edited.`);
    await dataSource.destroy();
}

void run();