import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class RolfLured implements AutomaticAchievement {
    name = "Rolf Lured";
    description = ["Win a Berlin spin in 10:07 or less"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.MAP_SPECIFIC;
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
            if (map.forfeit) {
                continue;
            }
            if (map.map !== HitmanMap.BERLIN) {
                continue;
            }
            if (map.timeTaken <= 0) {
                continue;
            }
            if (map.timeTaken >= 607) {
                continue;
            }

            if (
                map.winner === WinningPlayer.PLAYER_ONE &&
                playerOneAchievement.achievedAt[0] <= 0
            ) {
                playerOneAchievement.achievedAt[0] = match.timestamp;
                playerOneAchievement.progression[0] = 1;
            } else if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                playerTwoAchievement.achievedAt[0] <= 0
            ) {
                playerTwoAchievement.achievedAt[0] = match.timestamp;
                playerTwoAchievement.progression[0] = 1;
            }
        }
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].achievedAt = [0];
            achievements[player].progression = [0];
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
