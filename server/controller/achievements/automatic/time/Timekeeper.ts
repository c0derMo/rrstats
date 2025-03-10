import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { MapRecord } from "~/server/model/Record";
import { LessThan } from "typeorm";

export class Timekeeper extends AutomaticAchievement<number> {
    name = "Timekeeper";
    description = ["Hold 3 map records concurrently"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TIME;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        await this.checkForPlayer(playerOneAchievement);
        await this.checkForPlayer(playerTwoAchievement);
    }

    public async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ) {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        const allRecords = await MapRecord.find({
            order: {
                timestamp: "DESC",
            },
        });

        const currentRecord: Record<
            number,
            { time: number; holders: string[] }
        > = {};
        const holdingRecords: Record<string, number> = {};

        for (const record of allRecords) {
            if (currentRecord[record.map] == null) {
                currentRecord[record.map] = {
                    time: record.time,
                    holders: [record.player],
                };
                holdingRecords[record.player] =
                    (holdingRecords[record.player] ?? 0) + 1;
            } else if (currentRecord[record.map].time === record.time) {
                currentRecord[record.map].holders.push(record.player);
                holdingRecords[record.player] =
                    (holdingRecords[record.player] ?? 0) + 1;
            } else if (currentRecord[record.map].time > record.time) {
                for (const oldHolder of currentRecord[record.map].holders) {
                    holdingRecords[oldHolder] -= 1;
                }
                currentRecord[record.map] = {
                    time: record.time,
                    holders: [record.player],
                };
                holdingRecords[record.player] =
                    (holdingRecords[record.player] ?? 0) + 1;
            }

            for (const player in holdingRecords) {
                if (holdingRecords[player] >= 3) {
                    achievements[player].achieveIfNotAchieved(
                        record.timestamp,
                        0,
                        true,
                    );
                }
            }
        }
    }

    private async checkForPlayer(achievement: Achievement<number>) {
        const mapRecords = await MapRecord.findBy({
            player: achievement.player,
        });

        const nonBrokenRecords: MapRecord[] = [];
        for (const record of mapRecords) {
            const breakingRecord = await MapRecord.countBy({
                time: LessThan(record.time),
            });
            if (breakingRecord <= 0) {
                nonBrokenRecords.push(record);
            }
        }

        if (nonBrokenRecords.length >= 3) {
            const orderedTimestamps = nonBrokenRecords
                .map((record) => record.timestamp)
                .sort((a, b) => a - b);
            achievement.achieveIfNotAchieved(orderedTimestamps[2]);
        }
        achievement.progression = [Math.min(1, nonBrokenRecords.length / 3)];
    }
}
