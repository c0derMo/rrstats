import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { HitmanMap } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

const THE_BIG_FIVE: Partial<Record<HitmanMap, number>> = {
    [HitmanMap.COLORADO]: 0,
    [HitmanMap.SANTA_FORTUNA]: 1,
    [HitmanMap.MUMBAI]: 2,
    [HitmanMap.HAVEN_ISLAND]: 3,
    [HitmanMap.BERLIN]: 4,
};

export class TheSmallFive extends AutomaticAchievement<number[]> {
    name = "The Small Five";
    description = ["Achieve a PB under 10:00 on all five of the Big 5 maps"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP_SPECIFIC;
    levels = 1;

    public getDefaultData(): number[] {
        return Array(5).fill(601);
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number[]>,
        playerTwoAchievement: Achievement<number[]>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            if (THE_BIG_FIVE[map.map] == null) {
                continue;
            }
            if (map.timeTaken <= 0) {
                continue;
            }

            const idx = THE_BIG_FIVE[map.map]!;

            if (
                map.winner === WinningPlayer.PLAYER_ONE &&
                playerOneAchievement.data[idx] >= map.timeTaken
            ) {
                playerOneAchievement.data[idx] = map.timeTaken;
            } else if (
                map.winner === WinningPlayer.PLAYER_TWO &&
                playerTwoAchievement.data[idx] >= map.timeTaken
            ) {
                playerTwoAchievement.data[idx] = map.timeTaken;
            }
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<number[]>,
        achievementTimestamp: number,
    ) {
        const highestPB = Math.max(...achievement.data);

        if (highestPB <= 600) {
            achievement.achieveIfNotAchieved(achievementTimestamp);
        }

        achievement.progression = [
            achievement.data.filter((pb) => pb <= 600).length / 5,
        ];
    }
}
