import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";

export class TheRouletteRival extends AutomaticAchievement<
    Record<string, number>
> {
    name = "The Roulette Rival";
    description = [
        "Play 3 matches against the same opponent",
        "Play 5 matches against the same opponent",
        "Play 7 matches against the same opponent",
    ];
    tier = [
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.MATCH;
    levels = 3;

    public getDefaultData(): Record<string, number> {
        return {};
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<Record<string, number>>,
        playerTwoAchievement: Achievement<Record<string, number>>,
    ): Promise<void> {
        if (playerOneAchievement.data[match.playerTwo] == null) {
            playerOneAchievement.data[match.playerTwo] = 0;
        }
        playerOneAchievement.data[match.playerTwo] += 1;
        if (playerTwoAchievement.data[match.playerOne] == null) {
            playerTwoAchievement.data[match.playerOne] = 0;
        }
        playerTwoAchievement.data[match.playerOne] += 1;

        this.checkCondition(playerOneAchievement, match.timestamp, match.uuid);
        this.checkCondition(playerTwoAchievement, match.timestamp, match.uuid);
    }

    private checkCondition(
        achievement: Achievement<Record<string, number>>,
        timestamp: number,
        match: string,
    ) {
        const highestSameOppo = Math.max(...Object.values(achievement.data));

        const levelRequirements = [3, 5, 7];
        for (let i = 0; i < this.levels; i++) {
            if (highestSameOppo >= levelRequirements[i]) {
                achievement.achieveIfNotAchieved(timestamp, i, false, match);
            }
        }

        achievement.progression = levelRequirements.map((req) =>
            Math.min(1, highestSameOppo / req),
        );
        achievement.progressionString = levelRequirements.map(
            (req) => `${highestSameOppo} / ${req}`,
        );
    }
}
