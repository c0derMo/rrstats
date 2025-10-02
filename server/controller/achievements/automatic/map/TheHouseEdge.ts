import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class TheHouseEdge extends AutomaticAchievement<boolean> {
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
                map.picked === ChoosingPlayer.PLAYER_ONE
            ) {
                playerOneAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            } else if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                map.picked === ChoosingPlayer.PLAYER_TWO
            ) {
                playerTwoAchievement.achieveIfNotAchieved(
                    match.timestamp,
                    0,
                    true,
                );
            }
        }
    }
}
