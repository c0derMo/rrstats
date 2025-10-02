import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";

const casters: Record<
    string,
    {
        caster: string;
        [tourney: string]: number | string;
    }
> = {};
const tournaments: string[] = [];

async function main() {
    const dataSource = new DataSource({
        type: "postgres",
        url: "postgres://rrstats:insert_pw@127.0.0.1:5434/rrstats",
        entities: [PlayedMap, Match],
    });
    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        select: ["uuid", "competition", "shoutcasters"],
        order: {
            timestamp: "ASC",
        },
    });
    console.log(`Loaded ${matches.length} matches.`);

    for (const match of matches) {
        if (!tournaments.includes(match.competition)) {
            tournaments.push(match.competition);
        }

        if (match.shoutcasters == null) {
            continue;
        }

        for (const caster of match.shoutcasters) {
            casters[caster] ??= {
                caster: caster,
            };

            casters[caster][match.competition] ??= 0;
            (casters[caster][match.competition] as number) += 1;
        }
    }

    const headers = [
        { key: "caster", header: "CASTER" },
        ...tournaments.map((t) => ({ key: t, header: t.toUpperCase() })),
    ];

    const output = stringify(Object.values(casters), {
        header: true,
        columns: headers,
    });
    await writeFile("./castsPerTournament.csv", output, "utf-8");
}

void main();
