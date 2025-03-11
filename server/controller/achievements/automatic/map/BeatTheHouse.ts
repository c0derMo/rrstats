import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { MapRecord } from "~/server/model/Record";
import { LessThan } from "typeorm";
import { getAllMaps, type HitmanMap } from "~/utils/mapUtils";

export class BeatTheHouse extends AutomaticAchievement<boolean> {
    name = "Beat the House";
    description = ["Beat a player on a map where they hold the record"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP;
    levels = 1;

    public getDefaultData(): boolean {
        return false;
    }

    private async isRecordHolder(
        map: HitmanMap,
        playerUUID: string,
    ): Promise<boolean> {
        const record = await MapRecord.findOne({
            where: {
                map: map,
                player: playerUUID,
            },
            order: {
                timestamp: "DESC",
            },
        });
        if (record == null) {
            return false;
        }

        const beatingRecords = await MapRecord.countBy({
            map: map,
            time: LessThan(record.time),
        });
        if (beatingRecords > 0) {
            return false;
        }

        return true;
    }

    async handleMatch(
        match: Match,
        playerOneAchievement: Achievement<boolean>,
        playerTwoAchievement: Achievement<boolean>,
        checkingFunction: (map: HitmanMap, player: string) => Promise<boolean>,
    ) {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            if (map.winner === WinningPlayer.DRAW) {
                continue;
            }

            const loser =
                map.winner === WinningPlayer.PLAYER_ONE
                    ? match.playerTwo
                    : match.playerOne;
            if (!(await checkingFunction(map.map, loser))) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<boolean>,
        playerTwoAchievement: Achievement<boolean>,
    ): Promise<void> {
        await this.handleMatch(
            match,
            playerOneAchievement,
            playerTwoAchievement,
            this.isRecordHolder,
        );
    }

    public async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<boolean>>,
    ) {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        const allMapRecords = await MapRecord.find({
            order: {
                timestamp: "ASC",
            },
        });

        const recordsPerMap: Record<
            number,
            { timestamp: number; players: string[] }[]
        > = {};
        for (const map of getAllMaps()) {
            const recordsOfThisMap = allMapRecords.filter(
                (record) => record.map === map,
            );
            const shortenedRecordsThisMap: {
                timestamp: number;
                players: string[];
            }[] = [];
            for (let idx = 0; idx < recordsOfThisMap.length; idx++) {
                if (
                    recordsOfThisMap[idx - 1]?.time ===
                    recordsOfThisMap[idx].time
                ) {
                    shortenedRecordsThisMap.push({
                        timestamp: recordsOfThisMap[idx].timestamp,
                        players: [
                            ...shortenedRecordsThisMap[
                                shortenedRecordsThisMap.length - 1
                            ].players,
                            recordsOfThisMap[idx].player,
                        ],
                    });
                } else {
                    shortenedRecordsThisMap.push({
                        timestamp: recordsOfThisMap[idx].timestamp,
                        players: [recordsOfThisMap[idx].player],
                    });
                }
            }
            recordsPerMap[map] = shortenedRecordsThisMap;
        }

        for (const match of matches) {
            await this.handleMatch(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
                async (map, player) => {
                    const recordHolders = recordsPerMap[map].findLast(
                        (record) => record.timestamp < match.timestamp,
                    );
                    return recordHolders?.players.includes(player) ?? false;
                },
            );
        }
    }
}
