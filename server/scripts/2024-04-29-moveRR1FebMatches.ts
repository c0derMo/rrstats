import { DateTime } from "luxon";
import { DataSource } from "typeorm";
import { Match } from "~/server/model/Match";

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({ where: { competition: "RR1" } });
    console.log(`${matches.length} matches loaded.`);

    let count = 0;

    for (const match of matches) {
        const matchDate = DateTime.fromMillis(match.timestamp);

        if (matchDate.month === 2) {
            const newDate = matchDate.set({ month: 1 });
            match.timestamp = newDate.toMillis();
            await match.save();
            count++;
        }
    }
    console.log(
        `${matches.length} matches iterated, ${count} matches updated.`,
    );
    await dataSource.destroy();
}

void run();
