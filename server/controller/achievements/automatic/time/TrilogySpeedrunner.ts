import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class TrilogySpeedrunner extends AutomaticAchievement<number[]> {
    name = "Trilogy Speedrunner";
    description = ["Achieve a PB of 10:00 or less on any three maps combined"];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.TIME;
    levels = 1;

    public getDefaultData(): number[] {
        return getAllMaps().map(() => -1);
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number[]>,
        playerTwoAchievement: Achievement<number[]>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.timeTaken <= 0) {
                continue;
            }

            if (map.winner === WinningPlayer.PLAYER_ONE) {
                if (
                    playerOneAchievement.data[map.map] > map.timeTaken ||
                    playerOneAchievement.data[map.map] < 0
                ) {
                    playerOneAchievement.data[map.map] = map.timeTaken;
                }
            } else if (map.winner === WinningPlayer.PLAYER_TWO) {
                if (
                    playerTwoAchievement.data[map.map] > map.timeTaken ||
                    playerTwoAchievement.data[map.map] < 0
                ) {
                    playerTwoAchievement.data[map.map] = map.timeTaken;
                }
            }
        }
        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private checkCondition(
        achievement: Achievement<number[]>,
        timestamp: number,
    ) {
        const sortedTimes = achievement.data
            .filter((time) => time > 0)
            .sort((a, b) => a - b);
        if (sortedTimes.length < 3) {
            return;
        }
        if (sortedTimes[0] + sortedTimes[1] + sortedTimes[2] < 600) {
            achievement.achieveIfNotAchieved(timestamp, 0, true);
        }
    }
}
