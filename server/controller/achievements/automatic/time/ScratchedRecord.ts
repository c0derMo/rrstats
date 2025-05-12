import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { MapRecord } from "~/server/model/Record";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class ScratchedRecord extends AutomaticAchievement<number> {
    name = "Scratched Record";
    description = ["Beat your own map record"];
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
        for (const map of match.playedMaps) {
            if (map.winner === WinningPlayer.DRAW || map.timeTaken <= 0) {
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
            if (recordTime == null || map.timeTaken > recordTime.time) {
                continue;
            }

            const recordHolders = await MapRecord.findBy({
                map: map.map,
                time: recordTime.time,
            });
            const recordHolderPlayers = recordHolders.map(
                (record) => record.player,
            );

            if (
                map.winner === WinningPlayer.PLAYER_ONE &&
                recordHolderPlayers.includes(match.playerOne)
            ) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                    match.uuid,
                );
            } else if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                recordHolderPlayers.includes(match.playerTwo)
            ) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                    match.uuid,
                );
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

        for (const record of allRecords) {
            const previousRecordTime = allRecords.findLast(
                (prevRecord) =>
                    prevRecord.time > record.time &&
                    prevRecord.map === record.map,
            );
            if (previousRecordTime == null) {
                continue;
            }
            const previousRecordPlayers = allRecords
                .filter(
                    (record) =>
                        record.time === previousRecordTime.time &&
                        record.map === previousRecordTime.map,
                )
                .map((record) => record.player);
            if (previousRecordPlayers.includes(record.player)) {
                achievements[record.player].achieveIfNotAchieved(
                    record.timestamp,
                    0,
                    true,
                    record.match,
                );
            }
        }
    }
}
