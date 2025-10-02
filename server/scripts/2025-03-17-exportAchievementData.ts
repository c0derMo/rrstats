import { Player } from "../model/Player";
import { DataSource } from "typeorm";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { Achievement } from "../model/Achievement";
import AchievementController from "../controller/AchievementController";

interface IndividualAchievement {
    name: string;
    tier: string;
    achieved: number;
}

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Achievement, Player],
    });
    await dataSource.initialize();
    console.log("Database connection established.");

    const achievements: IndividualAchievement[] = [];

    const allPlayers = await Player.count();
    const dbAchievements = await Achievement.find();
    console.log(`Loaded ${dbAchievements.length} achievements.`);

    for (const ach of dbAchievements) {
        const achievementInfo =
            AchievementController.automaticAchievements.find(
                (achI) => achI.name === ach.achievement,
            );
        if (achievementInfo == null) {
            console.log(`No achievement info for ${ach.achievement}!!`);
            continue;
        }
        for (let i = 0; i < achievementInfo.levels; i++) {
            if (ach.achievedAt[i] <= 0) {
                continue;
            }
            const name = ach.achievement + " " + (i + 1).toString();
            const inListIdx = achievements.findIndex((aI) => aI.name === name);
            if (inListIdx < 0) {
                achievements.push({
                    name: name,
                    tier: tierToName(achievementInfo.tier[i]),
                    achieved: 1,
                });
            } else {
                achievements[inListIdx].achieved += 1;
            }
        }
    }

    const rows = achievements.map((ach) => {
        return {
            name: ach.name,
            tier: ach.tier,
            completion:
                ((ach.achieved / allPlayers) * 100).toFixed(2).toString() + "%",
        };
    });

    const headers = [
        { key: "name", header: "NAME" },
        { key: "tier", header: "TIER" },
        { key: "completion", header: "COMPLETION" },
    ];

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile("./achievements.csv", output, "utf-8");
}

function tierToName(t: AchievementTier): string {
    switch (t) {
        case AchievementTier.BRONZE:
            return "Bronze";
        case AchievementTier.SILVER:
            return "Silver";
        case AchievementTier.GOLD:
            return "Gold";
        case AchievementTier.PLATINUM:
            return "Platinum";
        default:
            return "Unknown";
    }
}

void main();
