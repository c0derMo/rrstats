import type { Match } from "~/server/model/Match";
import type { AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { MapRecord } from "~/server/model/Record";
import { LessThan } from "typeorm";
import type { HitmanMap } from "~/utils/mapUtils";
import { DateTime } from "luxon";

export class BeatTheHouse implements AutomaticAchievement {
    name = "Beat the House";
    description = ["Beat a player on a map where they hold the record"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP;
    levels = 1;

    recordHolders: Record<number, Record<string, boolean>> = {};
    lastCacheClear = 0;

    public getDefaultData(): boolean {
        return false;
    }

    private async isRecordHolder(
        map: HitmanMap,
        playerUUID: string,
    ): Promise<boolean | null> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.recordHolders = {};
            this.lastCacheClear = DateTime.now().toMillis();
        }
        if (this.recordHolders[map] == null) {
            this.recordHolders[map] = {};
        }
        if (this.recordHolders[map][playerUUID] != null) {
            return this.recordHolders[map][playerUUID];
        }

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
            this.recordHolders[map][playerUUID] = false;
            return false;
        }

        const beatingRecords = await MapRecord.countBy({
            map: map,
            time: LessThan(record.time),
        });
        if (beatingRecords > 0) {
            this.recordHolders[map][playerUUID] = false;
            return false;
        }

        this.recordHolders[map][playerUUID] = true;
        return true;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<boolean>,
        playerTwoAchievement: Achievement<boolean>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            if (map.winner === WinningPlayer.DRAW) {
                continue;
            }

            if (
                map.winner === WinningPlayer.PLAYER_ONE &&
                playerOneAchievement.data
            ) {
                continue;
            }
            if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                playerTwoAchievement.data
            ) {
                continue;
            }

            const loser =
                map.winner === WinningPlayer.PLAYER_ONE
                    ? match.playerTwo
                    : match.playerOne;
            if (!this.isRecordHolder(map.map, loser)) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data = true;
                playerOneAchievement.achievedAt[0] = match.timestamp;
                playerOneAchievement.progression[0] = 1;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.data = true;
                playerTwoAchievement.achievedAt[0] = match.timestamp;
                playerTwoAchievement.progression[0] = 1;
            }
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<boolean>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
        }

        for (const match of matches) {
            await this.update(
                match,
                achievements[match.playerOne],
                achievements[match.playerTwo],
            );
        }
    }
}
