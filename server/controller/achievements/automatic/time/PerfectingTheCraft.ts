import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { MapRecord } from "~/server/model/Record";
import { getAllMaps } from "~/utils/mapUtils";

export class PerfectingTheCraft extends AutomaticAchievement<number> {
    name = "Perfecting the Craft";
    description = ["Win a map with a time within one minute of the map record"];
    tier = [AchievementTier.SILVER];
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
        for (const map of match.playedMaps) {
            if (map.timeTaken <= 0) {
                continue;
            }

            const recordTime = await MapRecord.findOne({
                where: {
                    map: map.map,
                },
                order: {
                    timestamp: "DESC",
                },
            });

            if (recordTime != null) {
                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    this.checkCondition(
                        map.timeTaken,
                        recordTime.time,
                        playerOneAchievement,
                        match.timestamp,
                    );
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    this.checkCondition(
                        map.timeTaken,
                        recordTime.time,
                        playerTwoAchievement,
                        match.timestamp,
                    );
                }
            }
        }
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
                timestamp: "ASC",
            },
        });

        const recordsOfMap: Record<number, MapRecord[]> = {};
        for (const map of getAllMaps()) {
            recordsOfMap[map] = allRecords.filter(
                (record) => record.map === map,
            );
        }

        for (const match of matches) {
            for (const map of match.playedMaps) {
                if (map.timeTaken <= 0) {
                    continue;
                }

                const recordTimeAtTime = recordsOfMap[map.map].findLast(
                    (record) => record.timestamp < match.timestamp,
                );
                if (recordTimeAtTime == null) {
                    continue;
                }

                if (map.winner === WinningPlayer.PLAYER_ONE) {
                    this.checkCondition(
                        map.timeTaken,
                        recordTimeAtTime.time,
                        achievements[match.playerOne],
                        match.timestamp,
                    );
                } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                    this.checkCondition(
                        map.timeTaken,
                        recordTimeAtTime.time,
                        achievements[match.playerTwo],
                        match.timestamp,
                    );
                }
            }
        }
    }

    private checkCondition(
        mapTime: number,
        recordTime: number,
        achievement: Achievement<number>,
        timestamp: number,
    ) {
        if (mapTime - 60 <= recordTime) {
            achievement.achieveIfNotAchieved(timestamp, 0, true);
        }
    }
}
