import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

type AchievementDataType = Record<HitmanMap, number>;

export class HistoryRepeatsItself extends AutomaticAchievement<AchievementDataType> {
    name = "History Repeats Itself";
    description = [
        "Win 5 spins on the same map",
        "Win 10 spins on the same map",
        "Win 20 spins on the same map",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MAP;
    levels = 3;

    public getDefaultData(): AchievementDataType {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result as AchievementDataType;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<AchievementDataType>,
        playerTwoAchievement: Achievement<AchievementDataType>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data[map.map] += 1;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.data[map.map] += 1;
            }
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<Record<HitmanMap, number>>,
        achievementTimestamp: number,
    ) {
        const mostOnSameMap = Math.max(...Object.values(achievement.data));

        const levelRequirements = [5, 10, 20];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (mostOnSameMap >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((req) =>
            Math.min(1, mostOnSameMap / req),
        );
    }
}
