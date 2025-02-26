import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { ChoosingPlayer, WinningPlayer } from "~/utils/interfaces/IMatch";

export class TheHouseEdge implements AutomaticAchievement {
    name = "The House Edge";
    description = ["Win a map chosen by yourself"];
    tier = [AchievementTier.BRONZE];
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
            if (
                map.winner === WinningPlayer.PLAYER_ONE &&
                map.picked === ChoosingPlayer.PLAYER_ONE &&
                !playerOneAchievement.data
            ) {
                playerOneAchievement.data = true;
                if (playerOneAchievement.achievedAt[0] <= 0) {
                    playerOneAchievement.achievedAt[0] = match.timestamp;
                }
                playerOneAchievement.progression = [1];
            } else if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                map.picked === ChoosingPlayer.PLAYER_TWO &&
                !playerTwoAchievement.data
            ) {
                playerTwoAchievement.data = true;
                if (playerTwoAchievement.achievedAt[0] <= 0) {
                    playerTwoAchievement.achievedAt[0] = match.timestamp;
                }
                playerTwoAchievement.progression = [1];
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
