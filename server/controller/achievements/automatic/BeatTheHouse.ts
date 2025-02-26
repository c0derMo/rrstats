import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { MapRecord } from "~/server/model/Record";
import { LessThan } from "typeorm";

export class BeatTheHouse implements AutomaticAchievement {
    name = "Beat the House";
    description = ["Beat a player on a map where they hold the record"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP;
    levels = 1;

    public getDefaultData(): boolean {
        return false;
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
            const record = await MapRecord.findOne({
                where: {
                    map: map.map,
                    player: loser,
                },
                order: {
                    timestamp: "DESC",
                },
            });
            if (record == null) {
                continue;
            }

            const beatingRecords = await MapRecord.countBy({
                map: map.map,
                time: LessThan(record.time),
            });
            if (beatingRecords > 0) {
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
