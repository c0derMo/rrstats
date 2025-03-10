import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { getAllMaps } from "~/utils/mapUtils";

export class MasterOfNone extends AutomaticAchievement<number[]> {
    name = "Master of None";
    description = ["Achieve a PB of 15:00 or less on all 19 maps"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.TIME;
    levels = 1;

    public getDefaultData(): number[] {
        return getAllMaps().map(() => -1);
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number[]>,
        playerTwoAchievement: Achievement<number[]>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.timeTaken <= 0) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                if (
                    playerOneAchievement.data[map.map] > map.timeTaken ||
                    playerOneAchievement.data[map.map] < 0
                ) {
                    playerOneAchievement.data[map.map] = map.timeTaken;
                }
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                if (
                    playerTwoAchievement.data[map.map] > map.timeTaken ||
                    playerTwoAchievement.data[map.map] < 0
                ) {
                    playerTwoAchievement.data[map.map] = map.timeTaken;
                }
            }
        }
        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<number[]>,
        timestamp: number,
    ) {
        const mapsWithGoodPB = achievement.data.filter(
            (pb) => pb < 900 && pb > 0,
        ).length;

        if (mapsWithGoodPB === achievement.data.length) {
            achievement.achieveIfNotAchieved(timestamp);
        }
        achievement.progression = [
            Math.min(1, mapsWithGoodPB / achievement.data.length),
        ];
    }
}
