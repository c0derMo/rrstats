import type { Match } from "~/server/model/Match";
import type { AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { ChoosingPlayer } from "~/utils/interfaces/IMatch";
import type { HitmanMap } from "~/utils/mapUtils";

export class ILoveThatMap implements AutomaticAchievement {
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

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<HitmanMap[]>>,
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

    private checkCondition(
        achievement: Achievement<HitmanMap[]>,
        achievementTimestamp: number,
    ) {
        if (achievement.data.length >= 19) {
            if (achievement.achievedAt[0] <= 0) {
                achievement.achievedAt[0] = achievementTimestamp;
            }
        } else {
            achievement.achievedAt[0] = 0;
        }

        achievement.progression = [Math.min(1, achievement.data.length / 19)];
    }
}
