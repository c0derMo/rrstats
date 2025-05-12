import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class PointsForYou extends AutomaticAchievement<number> {
    name = "Points for You";
    description = [
        "Win a map",
        "Win 5 maps",
        "Win 10 maps",
        "Win 25 maps",
        "Win 50 maps",
        "Win 100 maps",
        "Win 250 maps",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MAP;
    levels = 7;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.winner === WinningPlayer.PLAYER_ONE) {
                playerOneAchievement.data += 1;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerTwoAchievement.data += 1;
            }
        }

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<number>,
        achievementTimestamp: number,
        match: string,
    ) {
        const levelRequirements = [1, 5, 10, 25, 50, 100, 250];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (achievement.data >= levelRequirements[idx]) {
                achievement.achieveIfNotAchieved(
                    achievementTimestamp,
                    idx,
                    false,
                    match,
                );
            }
        }

        achievement.progression = levelRequirements.map((m) =>
            Math.min(1, achievement.data / m),
        );
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${achievement.data} / ${requirement}`;
        });
    }
}
