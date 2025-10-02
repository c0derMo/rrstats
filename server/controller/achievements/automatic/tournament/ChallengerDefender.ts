import { Match } from "~~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~~/server/model/Achievement";
import { Competition, CompetitionPlacement } from "~~/server/model/Competition";

export class ChallengerDefender extends AutomaticAchievement<string[]> {
    name = "Challenger & Defender";
    description = ["Defend your title by winning two consecutive tournaments"];
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

    public override async recalculateAll(
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
            order: {
                startingTimestamp: "ASC",
            },
        });

        let previousWinners = await CompetitionPlacement.find({
            where: {
                placement: 1,
                competition: officialCompetitions[0].tag,
            },
        });

        for (let idx = 1; idx < officialCompetitions.length; idx++) {
            const currentWinners = await CompetitionPlacement.find({
                where: {
                    placement: 1,
                    competition: officialCompetitions[idx].tag,
                },
            });

            const prevWinnerPlayers = previousWinners.map(
                (placement) => placement.player,
            );
            const curWinnerPlayers = currentWinners.map(
                (placement) => placement.player,
            );

            for (const player of curWinnerPlayers) {
                if (prevWinnerPlayers.includes(player)) {
                    const lastMatch = await Match.findOne({
                        where: {
                            competition: officialCompetitions[idx].tag,
                        },
                        order: {
                            timestamp: "DESC",
                        },
                    });

                    achievements[player].achieveIfNotAchieved(
                        lastMatch?.timestamp ??
                            officialCompetitions[idx].startingTimestamp,
                        0,
                        true,
                    );
                }
            }

            previousWinners = currentWinners;
        }
    }
}
