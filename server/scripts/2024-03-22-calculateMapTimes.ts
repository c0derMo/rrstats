import { DataSource, In } from "typeorm";
import { Match } from "../model/Match";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { getAllMaps, getMap } from "~/utils/mapUtils";

function getQuartile(stats: number[], p: number): number {
    const sorted = [...stats].sort((a, b) => a - b);

    const k = p * stats.length;
    const fK = Math.floor(k);
    if (k === fK) {
        return Math.round(0.5 * (sorted[fK] + sorted[fK + 1]));
    } else {
        return sorted[fK + 1];
    }
}

function formatS(raw: number): string {
    const minutes = Math.floor(raw / 60);
    const seconds = raw % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
}

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({
        where: { competition: In(["RR13", "RRWC2023"]) },
    });
    console.log(`${matches.length} matches loaded.`);

    const finishDurations = new DefaultedMap<number[]>(() => []);
    for (const match of matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit) continue;
            if (map.timeTaken <= 0) continue;
            finishDurations.get(map.map.toString()).push(map.timeTaken);
        }
    }

    console.log(`Map              |  Avg  |  Med  |  25%  |  75%`);
    for (const map of getAllMaps()) {
        const stats = finishDurations.get(map.toString());
        const avg = Math.round(
            stats.reduce((prev, cur) => prev + cur, 0) / stats.length,
        );
        const med = getQuartile(stats, 0.5);
        const lowerQuart = getQuartile(stats, 0.25);
        const upperQuart = getQuartile(stats, 0.75);
        console.log(
            `${getMap(map)!.name.padEnd(16)} | ${formatS(avg)} | ${formatS(
                med,
            )} | ${formatS(lowerQuart)} | ${formatS(upperQuart)}`,
        );
    }

    await dataSource.destroy();
}

void run();
