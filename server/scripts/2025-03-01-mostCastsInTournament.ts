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

    const matches = await Match.find({
        relations: {
            playedMaps: false,
        },
    });
    console.log(`Loaded ${matches.length} matches.`);

    const tournaments: Record<string, Record<string, number>> = {};

    for (const match of matches) {
        if (match.shoutcasters == null || match.shoutcasters.length <= 0) {
            continue;
        }

        if (tournaments[match.competition] == null) {
            tournaments[match.competition] = {};
        }

        for (const caster of match.shoutcasters) {
            if (tournaments[match.competition][caster] == null) {
                tournaments[match.competition][caster] = 0;
            }
            tournaments[match.competition][caster] += 1;
        }
    }

    console.log("===");
    for (const tournament in tournaments) {
        let mostCasts = 0;
        let mostCasters: string[] = [];
        for (const caster in tournaments[tournament]) {
            if (tournaments[tournament][caster] > mostCasts) {
                mostCasts = tournaments[tournament][caster];
                mostCasters = [caster];
            } else if (tournaments[tournament][caster] == mostCasts) {
                mostCasters.push(caster);
            }
        }

        console.log(`${tournament}: ${mostCasters} (${mostCasts})`);
    }
}

void main();
