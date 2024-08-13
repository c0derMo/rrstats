import { readFile } from "node:fs/promises";

interface TimingStatistic {
    timesCalled: number;
    longestDuration: number;
    totalDuration: number;
    name: string;
}

const timingRegex = /^([^?(]*)(?:\?.+|\(.+\))?: (\d+)ms$/;

const ignoredRoutes = ["[GET] /rrCompetitions/", "[GET] /favicon.ico"];
const uniformingRoutes = [
    /(\[GET\] \/api\/v2\/accolade\/)\d+: (\d+)ms/,
    /(\[GET\] \/api\/v2\/map\/)[\w%]+: (\d+)ms/,
    /(\[GET\] \/api\/v2\/statistics\/)\d+: (\d+)ms/,
    /(\[GET\] \/api\/v2\/player\/)\d+: (\d+)ms/,
];
const renamingRoutes = {
    "[GET] /[player]: ": /\[GET\] \/[\w%]+: (\d+)ms/,
} as Record<string, RegExp>;

async function main() {
    const filename = process.argv.pop() as string;
    console.log(`Reading ${filename}...`);
    const lines = (await readFile(filename, "utf-8")).split("\r\n");

    console.log(lines.length);
    console.log(lines[0]);

    let timingLines = lines.filter((line) => {
        return timingRegex.exec(line) != null && !line.includes("_nuxt");
    });

    timingLines = timingLines.filter((line) => {
        for (const route of ignoredRoutes) {
            if (line.startsWith(route)) {
                return false;
            }
        }
        return true;
    });

    timingLines = timingLines.map((line) => {
        for (const route of uniformingRoutes) {
            const m = route.exec(line);
            if (m != null) {
                return `${m[1]}: ${m[2]}ms`;
            }
        }
        return line;
    });

    timingLines = timingLines.map((line) => {
        for (const route in renamingRoutes) {
            const reg = renamingRoutes[route];
            const m = reg.exec(line);
            if (m != null) {
                return `${route}: ${m[1]}ms`;
            }
        }
        return line;
    });

    console.log(`Found ${timingLines.length} lines containing timings.`);

    const timings = {} as Record<string, TimingStatistic>;

    for (const line of timingLines) {
        const match = timingRegex.exec(line);
        if (match == null) {
            throw new Error(`Line doesnt match regex the second time: ${line}`);
        }
        const functionName = match[1];
        const time = parseInt(match[2]);

        if (timings[functionName] == null) {
            timings[functionName] = {
                timesCalled: 1,
                longestDuration: time,
                totalDuration: time,
                name: functionName,
            };
        } else {
            timings[functionName].timesCalled += 1;
            timings[functionName].longestDuration = Math.max(
                timings[functionName].longestDuration,
                time,
            );
            timings[functionName].totalDuration += time;
        }
    }

    const namePadding = Math.max(
        8,
        Object.keys(timings)
            .map((t) => t.length)
            .reduce((prev, cur) => Math.max(prev, cur), 0),
    );
    const numCalledPadding = Math.max(
        10,
        Object.values(timings)
            .map((t) => String(t.timesCalled).length)
            .reduce((prev, cur) => Math.max(prev, cur), 0),
    );
    const longestDurationPadding = Math.max(
        1,
        Object.values(timings)
            .map((t) => String(t.longestDuration).length)
            .reduce((prev, cur) => Math.max(prev, cur), 0) + 2,
    );
    const totalDurationPadding = Math.max(
        5,
        Object.values(timings)
            .map((t) => String(t.totalDuration).length)
            .reduce((prev, cur) => Math.max(prev, cur), 0) + 2,
    );
    const averageDurationPadding = Math.max(
        5,
        Object.values(timings)
            .map((t) => String(t.totalDuration / t.timesCalled).length)
            .reduce((prev, cur) => Math.max(prev, cur), 0) + 2,
    );

    const sortingBy = process.argv.pop() as string;
    console.log(`Sorting by ${sortingBy}`);
    const result = Object.values(timings);
    if (sortingBy.toLowerCase() === "avg") {
        result.sort((a, b) => {
            return (
                a.totalDuration / a.timesCalled -
                b.totalDuration / b.timesCalled
            );
        });
    } else if (sortingBy.toLowerCase() === "total") {
        result.sort((a, b) => {
            return a.totalDuration - b.totalDuration;
        });
    } else if (sortingBy.toLowerCase() === "num") {
        result.sort((a, b) => {
            return a.timesCalled - b.timesCalled;
        });
    }

    console.log(
        `${"Function".padEnd(namePadding)} | ${"Num Called".padEnd(numCalledPadding)} | ${"Total".padEnd(totalDurationPadding)} | ${"Average".padEnd(averageDurationPadding)} | ${"Max".padEnd(longestDurationPadding)}`,
    );
    for (const line of result) {
        const averageLength = line.totalDuration / line.timesCalled;
        console.log(
            `${line.name.padEnd(namePadding)} | ${String(line.timesCalled).padEnd(numCalledPadding)} | ${String(line.totalDuration).padEnd(totalDurationPadding - 2)}ms | ${String(averageLength).padEnd(averageDurationPadding - 2)}ms | ${String(line.longestDuration).padEnd(longestDurationPadding - 2)}ms`,
        );
    }
}

void main();
