import type { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";

export class RarifiedAir extends AutomaticAchievement<number> {
    name = "Rarified Air";
    description = [
        "Play 5 matches in RRWC Knockout Stages",
        "Play 10 matches in RRWC Knockout Stages",
        "Play 25 matches in RRWC Knockout Stages",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.TOURNAMENT;
    levels = 3;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (
            !match.competition.toLowerCase().includes("rrwc") ||
            match.round.toLowerCase().includes("group")
        ) {
            return;
        }

        playerOneAchievement.data += 1;
        playerTwoAchievement.data += 1;

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<number>,
        achievementTimestamp: number,
        match: string,
    ) {
        const levelRequirements = [5, 10, 25];

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

        achievement.progression = levelRequirements.map((requirement) =>
            Math.min(1, achievement.data / requirement),
        );
        achievement.progressionString = levelRequirements.map((requirement) => {
            return `${achievement.data} / ${requirement}`;
        });
    }
}
