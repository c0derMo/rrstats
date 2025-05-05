import { Player } from "../model/Player";
import { DataSource } from "typeorm";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { Achievement } from "../model/Achievement";
import MapperService from "../controller/MapperService";
import { DateTime } from "luxon";
import { numberToRoman } from "~/utils/formatters";

interface IndividualAchievement {
    player: string;
    achievement: string;
    achieved: string;
}

async function main() {
    const dataSource = new DataSource({
        type: "better-sqlite3",
        database: "rrstats.db",
        entities: [Achievement, Player],
    });
    await dataSource.initialize();
    console.log("Database connection established.");

    const achievements: IndividualAchievement[] = [];

    const allPlayers = await Player.find();
    const dbAchievements = await Achievement.find();
    console.log(`Loaded ${dbAchievements.length} achievements.`);

    const playerLookup = MapperService.createStringMapFromList(allPlayers, "uuid", "primaryName");

    for (const ach of dbAchievements) {
        for (let tier = 0; tier < ach.achievedAt.length; tier++) {
            if (ach.achievedAt[tier] <= 0) {
                continue;
            }

            achievements.push({
                player: playerLookup[ach.player],
                achievement: tier > 0 ? ach.achievement + " " + numberToRoman(tier) : ach.achievement,
                achieved: DateTime.fromMillis(ach.achievedAt[tier]).toISODate() ?? "unknown date"
            });
        }
    }

    const headers = [
        { key: "player", header: "PLAYER" },
        { key: "achievement", header: "ACHIEVEMENT" },
        { key: "achieved", header: "DATE" },
    ];

    const output = stringify(achievements, { header: true, columns: headers });
    await writeFile("./achievements.csv", output, "utf-8");
}

void main();
