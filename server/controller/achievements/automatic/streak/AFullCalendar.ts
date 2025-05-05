import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition } from "~/server/model/Competition";
import { DateTime } from "luxon";

export class AFullCalendar extends AutomaticAchievement<string[]> {
    name = "A Full Calendar";
    description = [
        "Participate in all Roulette Rivals tournaments in the same year",
    ];
    tier = [AchievementTier.SILVER];
    category = AchievementCategory.STREAK;
    levels = 1;

    private tournamentsPerYearCache: Record<number, string[]>;
    private lastCacheClear = 0;

    private async getTournamentsPerYear(): Promise<Record<number, string[]>> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.lastCacheClear = DateTime.now().toMillis();
            this.tournamentsPerYearCache = {};

            const competitions = await Competition.findBy({
                officialCompetition: true,
            });

            for (const comp of competitions) {
                const year = DateTime.fromMillis(comp.startingTimestamp).year;
                if (this.tournamentsPerYearCache[year] == null) {
                    this.tournamentsPerYearCache[year] = [comp.tag];
                } else {
                    this.tournamentsPerYearCache[year].push(comp.tag);
                }
            }
        }

        return this.tournamentsPerYearCache;
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
        await this.checkCondition(playerOneAchievement);
        await this.checkCondition(playerTwoAchievement);
    }

    private async checkCondition(achievement: Achievement<string[]>) {
        const thisYear = DateTime.now().year;
        const tourneysPerYear = await this.getTournamentsPerYear();
        for (const stringYear in tourneysPerYear) {
            const year = parseInt(stringYear);
            if (thisYear === year) continue;

            if (
                tourneysPerYear[year].every((tourney) =>
                    achievement.data.includes(tourney),
                )
            ) {
                const lastDayOfYear = DateTime.fromObject({
                    year: year + 1,
                    month: 1,
                    day: 1,
                    hour: 10,
                }, { zone: 'Europe/Berlin' })
                    .minus({ days: 1 })
                    .toMillis();
                achievement.achieveIfNotAchieved(lastDayOfYear);
            }
        }
    }
}
