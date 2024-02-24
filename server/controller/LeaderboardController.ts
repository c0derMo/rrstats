import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import {
    LeaderboardCountryEntry,
    LeaderboardPlayerEntry,
} from "~/utils/interfaces/LeaderboardEntry";
import { Player } from "../model/Player";
import { Match } from "../model/Match";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { HitmanMap } from "~/utils/mapUtils";
import {
    EntitySubscriberInterface,
    EventSubscriber,
    In,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { DateTime } from "luxon";
import { PlayerWinrate } from "./leaderboardStatistics/player/Winrate";
import { PlayerMapWinrate } from "./leaderboardStatistics/player/MapWinrate";
import { CountryPlayers } from "./leaderboardStatistics/country/Players";
import { PlayerSweeps } from "./leaderboardStatistics/player/Sweeps";
import { PlayerSweeps6 } from "./leaderboardStatistics/player/Sweeps6";
import { PlayerReverseSweeps } from "./leaderboardStatistics/player/ReverseSweeps";
import { PlayerRRAppearances } from "./leaderboardStatistics/player/RRAppearances";
import { PlayerRRWCAppearances } from "./leaderboardStatistics/player/RRWCAppearances";
import { PlayerGFAppearances } from "./leaderboardStatistics/player/GFAppearances";
import { PlayerMatchesPlayed } from "./leaderboardStatistics/player/MatchesPlayed";
import { PlayerMatchesWon } from "./leaderboardStatistics/player/MatchesWon";
import { PlayerMapsPlayed } from "./leaderboardStatistics/player/MapsPlayed";
import { PlayerMapsWon } from "./leaderboardStatistics/player/MapsWon";
import { PlayerWROwnMaps } from "./leaderboardStatistics/player/WROwnMaps";
import { PlayerWROpponentMaps } from "./leaderboardStatistics/player/WROpponentMaps";
import { PlayerMatchesWonInARow } from "./leaderboardStatistics/player/MatchesWonInARow";
import { PlayerMapsWonInARow } from "./leaderboardStatistics/player/MapsWonInARow";
import { PlayerSpecificMapPlayed } from "./leaderboardStatistics/player/SpecificMapPlayed";
import { PlayerSpecificMapWinrate } from "./leaderboardStatistics/player/SpecificMapWinrate";
import { CountryMatches } from "./leaderboardStatistics/country/Matches";
import { CountryWins } from "./leaderboardStatistics/country/Wins";
import { CountryWinrate } from "./leaderboardStatistics/country/Winrate";
import { CountryTitles } from "./leaderboardStatistics/country/Titles";
import { PlayerAveragePlacement } from "./leaderboardStatistics/player/AveragePlacement";
import { PlayerElo } from "./leaderboardStatistics/player/Elo";
import { PlayerMatchesCasted } from "./leaderboardStatistics/player/MatchesCasted";

interface StatisticData<T extends string> {
    name: string;
    type: T;
    hasMaps: boolean;
    secondaryFilter?: string;
    explanatoryText?: string;
}

interface GenericLeaderboardStatistic<T extends string, R>
    extends StatisticData<T> {
    calculate: (
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ) => R[] | Record<HitmanMap, R[]>;
}

export interface LeaderboardPlayerStatistic
    extends GenericLeaderboardStatistic<"player", LeaderboardPlayerEntry> {}
export interface LeaderboardCountryStatistic
    extends GenericLeaderboardStatistic<"country", LeaderboardCountryEntry> {}

type LeaderboardStatistic =
    | LeaderboardPlayerStatistic
    | LeaderboardCountryStatistic;

export default class LeaderboardController {
    private static cache: Record<
        string,
        | LeaderboardPlayerEntry[]
        | LeaderboardCountryEntry[]
        | Record<
              HitmanMap,
              LeaderboardPlayerEntry[] | LeaderboardCountryEntry[]
          >
    > = {};
    private static calculationPromise: Promise<void> | null = null;

    private static readonly statistics: LeaderboardStatistic[] = [
        new PlayerWinrate(),
        new PlayerMapWinrate(),
        new PlayerRRAppearances(),
        new PlayerRRWCAppearances(),
        new PlayerAveragePlacement(),
        new PlayerGFAppearances(),
        new PlayerMatchesPlayed(),
        new PlayerMatchesWon(),
        new PlayerMapsPlayed(),
        new PlayerMapsWon(),
        new PlayerWROwnMaps(),
        new PlayerWROpponentMaps(),
        new PlayerMatchesWonInARow(),
        new PlayerMapsWonInARow(),
        new PlayerSweeps6(),
        new PlayerSweeps(),
        new PlayerReverseSweeps(),
        new PlayerSpecificMapPlayed(),
        new PlayerSpecificMapWinrate(),
        new PlayerElo(),
        new PlayerMatchesCasted(),

        new CountryPlayers(),
        new CountryMatches(),
        new CountryWins(),
        new CountryWinrate(),
        new CountryTitles(),
    ];

    public static async recalculate(): Promise<void> {
        LeaderboardController.calculationPromise =
            LeaderboardController._recalculate();
        try {
            await LeaderboardController.calculationPromise;
        } finally {
            LeaderboardController.calculationPromise = null;
        }
    }

    private static async _recalculate(): Promise<void> {
        // Empty the cache
        LeaderboardController.cache = {};

        // Query ALL THE THINGS
        const players = await Player.find();
        const matches = await Match.find();
        const competitions = await Competition.find({
            where: { officialCompetition: true },
        });
        const placements = await CompetitionPlacement.find({
            where: { competition: In(competitions.map((comp) => comp.tag)) },
        });

        for (const statistic of LeaderboardController.statistics) {
            const result = statistic.calculate(players, matches, placements);
            LeaderboardController.cache[statistic.name] = result;
        }
    }

    public static async getCategories(): Promise<{
        player: StatisticData<"player">[];
        country: StatisticData<"country">[];
    }> {
        return {
            player: LeaderboardController.statistics
                .filter((stat) => stat.type === "player")
                .map((stat) => {
                    return {
                        name: stat.name,
                        hasMaps: stat.hasMaps,
                        secondaryFilter: stat.secondaryFilter,
                        type: "player",
                        explanatoryText: stat.explanatoryText,
                    };
                }),
            country: LeaderboardController.statistics
                .filter((stat) => stat.type === "country")
                .map((stat) => {
                    return {
                        name: stat.name,
                        hasMaps: stat.hasMaps,
                        secondaryFilter: stat.secondaryFilter,
                        type: "country",
                        explanatoryText: stat.explanatoryText,
                    };
                }),
        };
    }

    public static async getEntries(
        category: string,
        map?: HitmanMap,
    ): Promise<LeaderboardPlayerEntry[] | LeaderboardCountryEntry[]> {
        if (LeaderboardController.calculationPromise != null) {
            await LeaderboardController.calculationPromise;
        }

        const statistic = LeaderboardController.statistics.find(
            (stat) => stat.name === category,
        );
        if (statistic == null) {
            return [];
        }
        if (statistic.hasMaps) {
            if (map == null) {
                return [];
            } else {
                return (
                    LeaderboardController.cache[category] as Record<
                        HitmanMap,
                        LeaderboardPlayerEntry[] | LeaderboardCountryEntry[]
                    >
                )[map];
            }
        } else {
            return LeaderboardController.cache[category] as
                | LeaderboardCountryEntry[]
                | LeaderboardPlayerEntry[];
        }
    }
}

@EventSubscriber()
export class LeaderboardDatabaseListener implements EntitySubscriberInterface {
    private lastDatabaseWrite: DateTime;
    private timerStart: DateTime;
    private invalidationTimer: NodeJS.Timeout | null = null;

    afterInsert(event: InsertEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    afterUpdate(event: UpdateEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    private invalidateLeaderboard(entity: unknown) {
        if (
            !(
                entity instanceof Player ||
                entity instanceof Match ||
                entity instanceof CompetitionPlacement
            )
        ) {
            return;
        }

        this.lastDatabaseWrite = DateTime.now();
        if (this.invalidationTimer === null) {
            this.timerStart = DateTime.now();
            this.invalidationTimer = setInterval(() => {
                const startDiff = Math.abs(
                    this.timerStart.diffNow().toMillis(),
                );
                const lastWriteDiff = Math.abs(
                    this.lastDatabaseWrite.diffNow().toMillis(),
                );
                if (startDiff > 1000 || lastWriteDiff > 100) {
                    void LeaderboardController.recalculate();
                    clearInterval(this.invalidationTimer as NodeJS.Timeout);
                    this.invalidationTimer = null;
                }
            }, 50);
        }
    }
}
