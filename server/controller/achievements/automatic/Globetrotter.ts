import type { Match } from "~/server/model/Match";
import { type AutomaticAchievement } from "../../AchievementController";
import type { Achievement } from "~/server/model/Achievement";
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";
import { AchievementTier } from "~/utils/interfaces/AchievementInfo";

export class Globetrotter implements AutomaticAchievement {
    name = "Globetrotter";
    description = [
        "Play a spin on every roulette map",
        "Play a spin on every roulette map 5 times",
        "Play a spin on every roulette map 10 times",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = "Experience";
    levels = 3;

    public getDefaultData(): Record<HitmanMap, number> {
        const result: Record<number, number> = {};
        for (const map of getAllMaps()) {
            result[map] = 0;
        }
        return result;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<Record<HitmanMap, number>>,
        playerTwoAchievement: Achievement<Record<HitmanMap, number>>,
    ): Promise<void> {
        for (const map of match.playedMaps) {
            if (map.forfeit) {
                continue;
            }
            playerOneAchievement.data[map.map] += 1;
            playerTwoAchievement.data[map.map] += 1;
        }

        this.checkCondition(playerOneAchievement, match.timestamp);
        this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<Record<HitmanMap, number>>>,
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
        achievement: Achievement<Record<HitmanMap, number>>,
        achievementTimestamp: number,
    ) {
        const lowestMapPlayed = Math.min(...Object.values(achievement.data));

        const levelRequirements = [1, 5, 10];

        for (let idx = 0; idx < levelRequirements.length; idx++) {
            if (lowestMapPlayed >= levelRequirements[idx]) {
                if (achievement.achievedAt[idx] <= 0) {
                    achievement.achievedAt[idx] = achievementTimestamp;
                }
            } else {
                achievement.achievedAt[idx] = 0;
            }
        }

        achievement.progression = [
            Math.min(
                1,
                Object.values(achievement.data).filter((m) => m >= 1).length /
                    19,
            ),
            Math.min(
                1,
                Object.values(achievement.data).filter((m) => m >= 5).length /
                    19,
            ),
            Math.min(
                1,
                Object.values(achievement.data).filter((m) => m >= 10).length /
                    19,
            ),
        ];
    }
}
