import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";

type AchievementData = Record<
    HitmanMap,
    {
        plays: number;
        wins: number;
    }
>;

export class NoWeaknesses extends AutomaticAchievement<AchievementData> {
    name = "No Weaknesses";
    description = [
        "Hold a winrate of at least 50% on all maps at the same time",
    ];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.MAP;
    levels = 1;

    public getDefaultData(): AchievementData {
        const result: Record<number, { plays: number; wins: number }> = {};
        for (const map of getAllMaps()) {
            result[map] = { plays: 0, wins: 0 };
        }
        return result as AchievementData;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<AchievementData>,
        playerTwoAchievement: Achievement<AchievementData>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            playerOneAchievement.data[map.map].plays += 1;
            playerTwoAchievement.data[map.map].plays += 1;
            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data[map.map].wins += 1;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.data[map.map].wins += 1;
            } else {
                playerOneAchievement.data[map.map].wins += 0.5;
                playerTwoAchievement.data[map.map].wins += 0.5;
            }

            this.checkCondition(playerOneAchievement, match.timestamp);
            this.checkCondition(playerTwoAchievement, match.timestamp);
        }
    }

    private checkCondition(
        achievement: Achievement<AchievementData>,
        achievementTimestamp: number,
    ) {
        const winrates: number[] = [];
        for (const data of Object.values(achievement.data)) {
            winrates.push(data.wins / data.plays);
        }

        if (Math.min(...winrates) >= 0.5) {
            achievement.achieveIfNotAchieved(achievementTimestamp);
        }
        achievement.progression = [
            winrates.filter((w) => w >= 0.5).length / 19,
        ];
    }
}
