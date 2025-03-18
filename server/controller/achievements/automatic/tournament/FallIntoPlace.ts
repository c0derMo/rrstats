import { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { In } from "typeorm";

export class FallIntoPlace extends AutomaticAchievement<string[]> {
    name = "Fall into Place";
    description = [
        "Finish a tournament in the top half of players",
        "Finish a tournament 9th or better",
        "Finish a tournament 5th or better",
        "Finish a tournament 3rd or better",
        "Finish a tournament 2nd or better",
    ];
    tier = [
        AchievementTier.BRONZE,
        AchievementTier.SILVER,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
        AchievementTier.GOLD,
    ];
    category = AchievementCategory.TOURNAMENT;
    levels = 5;

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
        const allOfficialPlacements = await CompetitionPlacement.find({
            where: {
                competition: In(officialCompetitions.map((comp) => comp.tag)),
            },
        });

        const placementsPerTourney: Record<string, number> = {};
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
            placementsPerTourney[comp.tag] = allOfficialPlacements.filter(
                (placement) => placement.competition === comp.tag,
            ).length;
        }

        for (const placement of allOfficialPlacements) {
            if (placement.placement == null) {
                continue;
            }

            const required = [
                placementsPerTourney[placement.competition] / 2,
                9,
                5,
                3,
                2,
            ];

            for (let i = 0; i < required.length; i++) {
                if (placement.placement <= required[i]) {
                    achievements[placement.player].achieveIfNotAchieved(
                        lastMatchesOfComps[placement.competition],
                        i,
                        true,
                    );
                } else {
                    break;
                }
            }
        }
    }
}
