import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition } from "~/server/model/Competition";
import { DateTime } from "luxon";
import { StreakCounter } from "~/utils/StreakCounter";

export class GuessWhosBack extends AutomaticAchievement<string[]> {
    name = "Guess Who's Back";
    description = [
        "Participate in 2 Roulette Rivals tournaments in a row",
        "Participate in 5 Roulette Rivals tournaments in a row",
        "Participate in 10 Roulette Rivals tournaments in a row",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.PLATINUM,
    ];
    category = AchievementCategory.STREAK;
    levels = 3;

    private tournamentOrderCache: string[];
    private lastCacheClear = 0;

    private async getTournamentsInOrder(): Promise<string[]> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.lastCacheClear = DateTime.now().toMillis();
            this.tournamentOrderCache = [];

            const competitions = await Competition.find({
                where: {
                    officialCompetition: true,
                },
                order: {
                    startingTimestamp: "ASC",
                },
            });
            this.tournamentOrderCache = competitions.map((comp) => comp.tag);
        }

        return this.tournamentOrderCache;
    }

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<string[]>,
        playerTwoAchievement: Achievement<string[]>,
    ): Promise<void> {
        if (!playerOneAchievement.data.includes(match.competition)) {
            playerOneAchievement.data.push(match.competition);
        }
        if (!playerTwoAchievement.data.includes(match.competition)) {
            playerTwoAchievement.data.push(match.competition);
        }
        await this.checkCondition(playerOneAchievement, match.timestamp);
        await this.checkCondition(playerTwoAchievement, match.timestamp);
    }

    private async checkCondition(
        achievement: Achievement<string[]>,
        timestamp: number,
    ) {
        const streak = new StreakCounter();
        const tourneyOrder = await this.getTournamentsInOrder();

        for (const comp of tourneyOrder) {
            if (achievement.data.includes(comp)) {
                streak.increaseStreak();
            } else {
                streak.resetStreak();
            }
        }

        const requirements = [2, 5, 10];

        for (let idx = 0; idx < requirements.length; idx++) {
            if (streak.getLongestStreak() > requirements[idx]) {
                achievement.achieveIfNotAchieved(timestamp, idx);
            }
        }

        achievement.progression = requirements.map((req) =>
            Math.min(1, streak.getLongestStreak() / req),
        );
        achievement.progressionString = requirements.map((req) => {
            return `${streak.getLongestStreak()} / ${req}`;
        });
    }
}
