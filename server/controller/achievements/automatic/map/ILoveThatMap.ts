import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { ChoosingPlayer } from "~/utils/interfaces/IMatch";
import type { HitmanMap } from "~/utils/mapUtils";

export class ILoveThatMap extends AutomaticAchievement<HitmanMap[]> {
    name = "I Love That Map";
    description = ["Pick every map in the trilogy once"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MAP;
    levels = 1;

    public getDefaultData(): HitmanMap[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<HitmanMap[]>,
        playerTwoAchievement: Achievement<HitmanMap[]>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (
                map.picked === ChoosingPlayer.PLAYER_ONE &&
                !playerOneAchievement.data.includes(map.map)
            ) {
                playerOneAchievement.data.push(map.map);
            } else if (
                map.picked === ChoosingPlayer.PLAYER_TWO &&
                !playerTwoAchievement.data.includes(map.map)
            ) {
                playerTwoAchievement.data.push(map.map);
            }
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<HitmanMap[]>,
        achievementTimestamp: number,
    ) {
        if (achievement.data.length >= 19) {
            achievement.achieveIfNotAchieved(achievementTimestamp);
        }

        achievement.progression = [Math.min(1, achievement.data.length / 19)];
        achievement.progressionString = [`${achievement.data.length} / 19`];
    }
}
