import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class IHateThatMap extends AutomaticAchievement<HitmanMap[]> {
    name = "I Hate That Map";
    description = ["Ban every map in the trilogy once"];
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
        for (const map of match.bannedMaps) {
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
