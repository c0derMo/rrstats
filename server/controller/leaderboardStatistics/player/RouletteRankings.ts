import { Competition, CompetitionPlacement } from "~~/server/model/Competition";
import type { LeaderboardPlayerStatistic } from "../../LeaderboardController";
import ld from "lodash";
import { Brackets } from "typeorm";

interface Ranking {
    player: string;
    totalScore: number;
    entries: {
        competition: string;
        score: number;
        placement: number | undefined;
    }[];
}

export class PlayerRouletteRankings implements LeaderboardPlayerStatistic {
    type = "player" as const;
    name = "Roulette Rankings";
    hasMaps = false;

    basedOn = ["placement" as const, "comp" as const];

    getScoreForPlacement(placement: number | undefined, competition: string) {
        if (competition.toLowerCase().startsWith("rrwc")) {
            if (placement == null) {
                return 10;
            } else if (placement === 1) {
                return 150;
            } else if (placement === 2) {
                return 120;
            } else if (placement === 3) {
                return 105;
            } else if (placement === 4) {
                return 90;
            } else if (placement <= 6) {
                return 75;
            } else if (placement <= 8) {
                return 60;
            } else if (placement <= 12) {
                return 45;
            } else if (placement <= 16) {
                return 30;
            } else if (placement <= 24) {
                return 20;
            } else if (placement <= 32) {
                return 15;
            } else {
                return 10;
            }
        } else {
            if (placement == null) {
                return 5;
            } else if (placement === 1) {
                return 100;
            } else if (placement === 2) {
                return 80;
            } else if (placement === 3) {
                return 70;
            } else if (placement === 4) {
                return 60;
            } else if (placement <= 6) {
                return 50;
            } else if (placement <= 8) {
                return 40;
            } else if (placement <= 12) {
                return 30;
            } else if (placement <= 16) {
                return 20;
            } else if (placement <= 24) {
                return 15;
            } else if (placement <= 32) {
                return 10;
            } else {
                return 5;
            }
        }
    }

    async calculate(): Promise<LeaderboardPlayerEntry[]> {
        const validCompetitions = await Competition.createQueryBuilder("comp")
            .orderBy("comp.startingTimestamp", "DESC")
            .where(
                new Brackets((qb) => {
                    return qb
                        .where("comp.updateWithHitmaps == FALSE")
                        .orWhere("comp.updateWithHitmaps IS NULL");
                }),
            )
            .andWhere("comp.officialCompetition = TRUE")
            .select(["comp.tag", "comp.name"])
            .limit(4)
            .getMany();

        const placements = await CompetitionPlacement.createQueryBuilder(
            "placement",
        )
            .where("placement.competition IN (:...tags)", {
                tags: validCompetitions.map((comp) => comp.tag),
            })
            .select([
                "placement.player",
                "placement.competition",
                "placement.placement",
            ])
            .getMany();

        const ranking: Record<string, Ranking> = {};
        for (const placement of placements) {
            ranking[placement.player] ??= {
                player: placement.player,
                totalScore: 0,
                entries: [],
            };
            const score = this.getScoreForPlacement(
                placement.placement,
                placement.competition,
            );
            ranking[placement.player].totalScore += score;
            ranking[placement.player].entries.push({
                competition: placement.competition,
                placement: placement.placement,
                score: score,
            });
        }

        const sortedRankings = ld.orderBy(
            Object.values(ranking).map((ranking) => {
                const sortedEntries = ranking.entries.sort((a, b) => {
                    return (
                        (a.placement ?? Number.MAX_SAFE_INTEGER) -
                        (b.placement ?? Number.MAX_SAFE_INTEGER)
                    );
                });
                const filteredScore = ld
                    .take(sortedEntries, 3)
                    .reduce((prev, cur) => prev + cur.score, 0);

                return {
                    player: ranking.player,
                    totalScore: filteredScore,
                    entries: sortedEntries,
                };
            }),
            [
                "totalScore",
                (e) => e.entries[0]?.placement ?? Number.MAX_SAFE_INTEGER,
                (e) => e.entries[1]?.placement ?? Number.MAX_SAFE_INTEGER,
                (e) => e.entries[2]?.placement ?? Number.MAX_SAFE_INTEGER,
                (e) => e.entries[3]?.placement ?? Number.MAX_SAFE_INTEGER,
            ],
            ["desc", "asc", "asc", "asc", "asc"],
        );

        const result: LeaderboardPlayerEntry[] = [];
        for (const rankedPlayer of sortedRankings) {
            result.push({
                player: rankedPlayer.player,
                displayScore: rankedPlayer.totalScore.toString(),
                sortingScore: sortedRankings.findIndex((p) => {
                    return (
                        p.totalScore === rankedPlayer.totalScore &&
                        p.entries[0]?.score ===
                            rankedPlayer.entries[0]?.score &&
                        p.entries[1]?.score ===
                            rankedPlayer.entries[1]?.score &&
                        p.entries[2]?.score ===
                            rankedPlayer.entries[2]?.score &&
                        p.entries[3]?.score === rankedPlayer.entries[3]?.score
                    );
                }),
            });
        }

        return result;
    }
}
