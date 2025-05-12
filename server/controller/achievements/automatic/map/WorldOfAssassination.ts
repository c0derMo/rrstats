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

export class WorldOfAssassination extends AutomaticAchievement<AchievementDataType> {
    name = "World of Assassination";
    description = [
        "Win a spin on every map in the trilogy",
        "Win 3 spins on every map in the trilogy",
        "Win 6 spins on every map in the trilogy",
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
        const lowestMapPlayed = Math.min(...Object.values(achievement.data));

        const levelRequirements = [1, 3, 6];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (lowestMapPlayed >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(achievementTimestamp, idx);
            }
        }

        achievement.progression = levelRequirements.map((req) =>
            Math.min(
                1,
                Object.values(achievement.data).filter((m) => m >= req).length /
                    19,
            ),
        );
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${Object.values(achievement.data).filter((m) => m >= requirement).length} / 19`;
        });
    }
}
