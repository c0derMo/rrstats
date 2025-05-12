import { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";

export class DoubleDown extends AutomaticAchievement<number> {
    name = "Double Down";
    description = [
        "Finish a tournament 9th or better two tournaments in a row",
    ];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.STREAK;
    levels = 1;

    public getDefaultData(): number {
        return 0;
    }

    async update(
        _: Match,
        _1: Achievement<number>,
        _2: Achievement<number>,
    ): Promise<void> {
        // Do nothing - only placements are relevant to this achievement, not matches
    }

    async recalculateAll(
        matches: Match[],
        achievements: Record<string, Achievement<number>>,
    ): Promise<void> {
        for (const player in achievements) {
            achievements[player].data = this.getDefaultData();
            achievements[player].achievedAt.fill(0);
            achievements[player].progression.fill(0);
        }

        const competitions = await Competition.find({
            where: {
                officialCompetition: true,
            },
            order: {
                startingTimestamp: "ASC",
            },
        });

        let previousPlacements = await CompetitionPlacement.findBy({
            competition: competitions[0].tag,
        });

        for (let idx = 1; idx < competitions.length; idx++) {
            const thesePlacements = await CompetitionPlacement.findBy({
                competition: competitions[idx].tag,
            });
            const lastMatchThisComp = await Match.findOne({
                where: {
                    competition: competitions[idx].tag,
                },
                order: {
                    timestamp: "DESC",
                },
            });

            for (const player in achievements) {
                const previousPlacement = Math.max(
                    ...getPlacementsOfPlayer(previousPlacements, player),
                );
                const thisPlacement = Math.max(
                    ...getPlacementsOfPlayer(thesePlacements, player),
                );
                if (
                    previousPlacement <= 9 &&
                    thisPlacement <= 9 &&
                    previousPlacement > 0 &&
                    thisPlacement > 0
                ) {
                    achievements[player].achieveIfNotAchieved(
                        lastMatchThisComp?.timestamp ??
                            competitions[idx].startingTimestamp,
                    );
                }
            }

            previousPlacements = thesePlacements;
        }
    }
}

function getPlacementsOfPlayer(
    placements: CompetitionPlacement[],
    player: string,
): number[] {
    return placements
        .filter((placement) => placement.player === player)
        .filter((placement) => placement.placement != null)
        .map((placement) => placement.placement!);
}
