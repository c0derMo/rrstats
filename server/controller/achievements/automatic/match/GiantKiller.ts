import type { Match } from "~/server/model/Match";
import { AutomaticAchievement } from "../AutomaticAchievement";
import type { Achievement } from "~/server/model/Achievement";
import {
    AchievementCategory,
    AchievementTier,
} from "~/utils/interfaces/AchievementInfo";
import { DateTime } from "luxon";
import { Competition, CompetitionPlacement } from "~/server/model/Competition";
import { In, MoreThan } from "typeorm";

export class GiantKiller extends AutomaticAchievement<number> {
    name = "Giant Killer";
    description = ["Defeat an RR Champion in a match"];
    tier = [AchievementTier.GOLD];
    category = AchievementCategory.MATCH;
    levels = 1;

    tournamentTimestampCache: Record<string, number> = {};
    becameChampionCache: Record<string, number> = {};
    officialTournamentsCache: string[] = [];
    lastCacheClear = 0;

    private async isChampion(
        playerUUID: string,
        timestamp: number,
    ): Promise<boolean> {
        if (DateTime.now().toMillis() - this.lastCacheClear > 60 * 1000) {
            this.tournamentTimestampCache = {};
            this.becameChampionCache = {};
            this.officialTournamentsCache = [];
            this.lastCacheClear = DateTime.now().toMillis();
        }

        if (this.becameChampionCache[playerUUID] == null) {
            if (this.officialTournamentsCache.length <= 0) {
                const officialCompetitions = await Competition.findBy({
                    officialCompetition: true,
                });
                this.officialTournamentsCache = officialCompetitions.map(
                    (t) => t.tag,
                );
            }

            const hasWinPlacement = await CompetitionPlacement.findBy({
                player: playerUUID,
                competition: In(this.officialTournamentsCache),
                placement: 1,
            });

            const champStartingTimestamps: number[] = [];
            for (const wonComp of hasWinPlacement) {
                if (
                    this.tournamentTimestampCache[wonComp.competition] == null
                ) {
                    const thisTourneyStarting =
                        await Competition.findOneByOrFail({
                            tag: wonComp.competition,
                        });
                    const nextTourneyStarting = await Competition.findOne({
                        where: {
                            startingTimestamp: MoreThan(
                                thisTourneyStarting.startingTimestamp,
                            ),
                            officialCompetition: true,
                        },
                        order: {
                            startingTimestamp: "ASC",
                        },
                    });
                    this.tournamentTimestampCache[wonComp.competition] =
                        nextTourneyStarting?.startingTimestamp ?? -1;
                }
                if (this.tournamentTimestampCache[wonComp.competition] > 0) {
                    champStartingTimestamps.push(
                        this.tournamentTimestampCache[wonComp.competition],
                    );
                }
            }

            this.becameChampionCache[playerUUID] = Math.min(
                ...champStartingTimestamps,
            );
        }

        return this.becameChampionCache[playerUUID] <= timestamp;
    }

    public getDefaultData(): number {
        return 0;
    }

    async update(
        match: Match,
        playerOneAchievement: Achievement<number>,
        playerTwoAchievement: Achievement<number>,
    ): Promise<void> {
        if (
            match.playerOneScore > match.playerTwoScore &&
            (await this.isChampion(match.playerTwo, match.timestamp))
        ) {
            playerOneAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        } else if (
            match.playerTwoScore > match.playerOneScore &&
            (await this.isChampion(match.playerOne, match.timestamp))
        ) {
            playerTwoAchievement.achieveIfNotAchieved(
                match.timestamp,
                0,
                true,
                match.uuid,
            );
        }
    }
}
