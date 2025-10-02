import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class SpinTheWheel extends AutomaticAchievement<number> {
    name = "Spin the Wheel";
    description = [
        "Play 5 maps",
        "Play 25 maps",
        "Play 50 maps",
        "Play 100 maps",
        "Play 200 maps",
        "Play 300 maps",
        "Play 400 maps",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.EXPERIENCE;
    levels = 7;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        const nonForfeitMapLength = match.playedMaps.filter(
            (map) => !map.forfeit,
        ).length;

        playerOneAchievement.data += nonForfeitMapLength;
        playerTwoAchievement.data += nonForfeitMapLength;

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<number>,
        achievementTimestamp: number,
        match: string,
    ) {
        const levelRequirements = [5, 25, 50, 100, 200, 300, 400];

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

        achievement.progression = levelRequirements.map((requirement) => {
            return Math.min(1, achievement.data / requirement);
        });
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${achievement.data} / ${requirement}`;
        });
    }
}
