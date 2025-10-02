import { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";
import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import { In } from "typeorm";

export class AllRounder extends AutomaticAchievement<boolean[]> {
    name = "All-Rounder";
    description = [
        "Win a Roulette Rivals tournament and a Roulette Rivals World Championship",
    ];
    tier = [AchievementTier.PLATINUM];
    category = AchievementCategory.TOURNAMENT;
    levels = 1;

    public getDefaultData(): boolean[] {
        return [false, false];
    }

    async update(
        _: Match,
        _1: Achievement<boolean[]>,
        _2: Achievement<boolean[]>,
    ): Promise<void> {
        // Do nothing - only placements are relevant to this achievement, not matches
    }

    public override async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<boolean[]>>,
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
            if (winner.competition.toLowerCase().includes("wc")) {
                achievements[winner.player].data[0] = true;
            } else {
                achievements[winner.player].data[1] = true;
            }

            if (
                achievements[winner.player].data[0] &&
                achievements[winner.player].data[1]
            ) {
                achievements[winner.player].achieveIfNotAchieved(
                    lastMatchesOfComps[winner.competition],
                    0,
                    true,
                );
            }
        }
    }
}
