import { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { In } from "typeorm";

export class Champion extends AutomaticAchievement<string[]> {
    name = "Champion";
    description = ["Win a Roulette Rivals tournament"];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    public getDefaultData(): string[] {
        return [];
    }

    async update(
        _: Match,
        _1: Achievement<string[]>,
        _2: Achievement<string[]>,
    ): Promise<void> {
        // Do nothing - only placements are relevant to this achievement, not matches
    }

    public async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<string[]>>,
    ) {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        const officialCompetitions = await Competition.find({
            where: {
                officialCompetition: true,
            },
        });
        const winners = await CompetitionPlacement.find({
            where: {
                placement: 1,
                competition: In(officialCompetitions.map((comp) => comp.tag)),
            },
        });

        const lastMatchesOfComps: Record<string, number> = {};
        for (const comp of officialCompetitions) {
            const lastMatch = await Match.findOne({
                where: {
                    competition: comp.tag,
                },
                order: {
                    timestamp: "DESC",
                },
            });
            lastMatchesOfComps[comp.tag] =
                lastMatch?.timestamp ?? comp.startingTimestamp;
        }

        for (const winner of winners) {
            achievements[winner.player].achieveIfNotAchieved(
                lastMatchesOfComps[winner.competition],
                0,
                true,
            );
        }
    }
}
