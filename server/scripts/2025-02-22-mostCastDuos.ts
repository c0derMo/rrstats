import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";

function areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) {
        return false;
    }

    return Array.from(set1).every((value) => set2.has(value));
}

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
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

    const castingDuos: { duo: Set<string>; casts: number }[] = [];
    for (const match of matches) {
        if (match.shoutcasters == null || match.shoutcasters.length <= 1) {
            continue;
        }
        const castDuo = new Set(match.shoutcasters);
        const entry = castingDuos.find((a) => areSetsEqual(a.duo, castDuo));
        if (entry == null) {
            castingDuos.push({ duo: castDuo, casts: 1 });
        } else {
            entry.casts += 1;
        }
    }

    castingDuos.sort((a, b) => a.casts - b.casts);

    console.log("====");
    console.log("Stats:");

    for (const caster of castingDuos) {
        console.log(
            `${[...caster.duo.values()].join(", ").padEnd(50, " ")}: ${caster.casts}`,
        );
    }
}

void main();
