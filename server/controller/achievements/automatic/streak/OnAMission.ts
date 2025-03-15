import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

type AchievementData = Record<HitmanMap, number>;

export class OnAMission extends AutomaticAchievement<AchievementData> {
    name = "On a Mission";
    description = [
        "Win 2 spins in a row on the same map",
        "Win 5 spins in a row on the same map",
        "Win 10 spins in a row on the same map",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.STREAK;
    levels = 3;

    public getDefaultData(): AchievementData {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result as AchievementData;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<AchievementData>,
        playerTwoAchievement: Achievement<AchievementData>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data[map.map] += 1;
                playerTwoAchievement.data[map.map] = 0;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerOneAchievement.data[map.map] = 0;
                playerTwoAchievement.data[map.map] += 1;
            } else {
                playerOneAchievement.data[map.map] = 0;
                playerTwoAchievement.data[map.map] = 0;
            }

            this.checkCondition(playerOneAchievement, match.timestamp);
            this.checkCondition(playerTwoAchievement, match.timestamp);
        }
    }

    private checkCondition(
        achievement: Achievement<AchievementData>,
        timestamp: number,
    ) {
        const requirements = [2, 5, 10];
        const longestStreak = Math.max(...Object.values(achievement.data));

        for (let idx = 0; idx < requirements.length; idx++) {
            if (longestStreak >= requirements[idx]) {
                achievement.achieveIfNotAchieved(timestamp, idx);
            }
        }

        achievement.progression = requirements.map((req) =>
            Math.min(1, longestStreak / req),
        );
        achievement.progressionString = requirements.map((req) => {
            return `${longestStreak} / ${req}`;
        });
    }
}
