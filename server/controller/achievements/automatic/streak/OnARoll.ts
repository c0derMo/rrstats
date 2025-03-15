import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { WinningPlayer } from "~/utils/interfaces/IMatch";

export class OnARoll extends AutomaticAchievement<number> {
    name = "On a Roll";
    description = [
        "Win 5 maps in a row",
        "Win 10 maps in a row",
        "Win 15 maps in a row",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.STREAK;
    levels = 3;

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
                playerTwoAchievement.data = 0;
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                playerOneAchievement.data = 0;
                playerTwoAchievement.data += 1;
            } else {
                playerOneAchievement.data = 0;
                playerTwoAchievement.data = 0;
            }

            this.checkCondition(playerOneAchievement, match.timestamp);
            this.checkCondition(playerTwoAchievement, match.timestamp);
        }
    }

    private checkCondition(
        achievement: Achievement<number>,
        timestamp: number,
    ) {
        const requirements = [5, 10, 15];

        for (let idx = 0; idx < requirements.length; idx++) {
            if (achievement.data >= requirements[idx]) {
                achievement.achieveIfNotAchieved(timestamp, idx);
            }
        }

        achievement.progression = requirements.map((req) =>
            Math.min(1, achievement.data / req),
        );
        achievement.progressionString = requirements.map((req) => {
            return `${achievement.data} / ${req}`;
        });
    }
}
