import type {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer } from "~/utils/interfaces/IPlayer";
import type {
    LeaderboardCountryEntry,
    LeaderboardMapEntry,
    LeaderboardPlayerEntry,
} from "~/utils/interfaces/LeaderboardEntry";
import { Player } from "../model/Player";
import { Match } from "../model/Match";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { type HitmanMap, OptionalMap } from "~/utils/mapUtils";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    In,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
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
import { MapPicked } from "./leaderboardStatistics/map/Picked";
import { MapBanned } from "./leaderboardStatistics/map/Banned";
import { MapPlayed } from "./leaderboardStatistics/map/Played";
import { MapRNG } from "./leaderboardStatistics/map/RNG";
import { MapAppearance } from "./leaderboardStatistics/map/Appearances";
import { PlayerSameMapWonInARow } from "./leaderboardStatistics/player/SameMapWonInARow";
import { Log } from "~/utils/FunctionTimer";
import consola from "consola";
import { PlayedMap } from "../model/PlayedMap";

export interface StatisticData<T extends string> {
    name: string;
    type: T;
    hasMaps?: boolean;
    mapOptional?: boolean;
    secondaryFilter?: string;
    explanatoryText?: string;
    defaultSecondaryFilter?: number;
}

interface GenericLeaderboardStatistic<T extends string, R>
    extends StatisticData<T> {
    calculate: (
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
        officialCompetitions: ICompetition[],
    ) => R[] | Record<HitmanMap, R[]> | Record<HitmanMap | OptionalMap, R[]>;
}

export interface LeaderboardPlayerStatistic
    extends GenericLeaderboardStatistic<"player", LeaderboardPlayerEntry> {}
export interface LeaderboardCountryStatistic
    extends GenericLeaderboardStatistic<"country", LeaderboardCountryEntry> {}
export interface LeaderboardMapStatistic
    extends GenericLeaderboardStatistic<"map", LeaderboardMapEntry> {}

export type LeaderboardStatistic =
    | LeaderboardPlayerStatistic
    | LeaderboardCountryStatistic
    | LeaderboardMapStatistic;

export type LeaderboardEntry =
    | LeaderboardPlayerEntry
    | LeaderboardCountryEntry
    | LeaderboardMapEntry;

const logger = consola.withTag("rrstats:leaderboards");

export default class LeaderboardController {
    private static cache: Record<
        string,
        | LeaderboardPlayerEntry[]
        | LeaderboardCountryEntry[]
        | LeaderboardMapEntry[]
        | Record<HitmanMap, LeaderboardEntry[]>
        | Record<HitmanMap | OptionalMap, LeaderboardEntry[]>
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
        new PlayerSameMapWonInARow(),
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

        new MapPicked(),
        new MapBanned(),
        new MapPlayed(),
        new MapRNG(),
        new MapAppearance(),
    ];

    public static async recalculate(): Promise<void> {
        LeaderboardController.calculationPromise =
            LeaderboardController._recalculate();
        try {
            await LeaderboardController.calculationPromise;
        } finally {
            LeaderboardController.calculationPromise = null;
        }
        logger.info("Leaderboards recalculated.");
    }

    @Log("LeaderboardController._recalculate")
    private static async _recalculate(): Promise<void> {
        // Empty the cache
        LeaderboardController.cache = {};

        // Query ALL THE THINGS
        const players = await Player.find();
        const matches = await Match.find({
            order: { timestamp: "ASC" },
        });
        const competitions = await Competition.find({
            where: { officialCompetition: true },
            order: { startingTimestamp: "DESC" },
        });
        const placements = await CompetitionPlacement.find({
            where: { competition: In(competitions.map((comp) => comp.tag)) },
        });

        for (const statistic of LeaderboardController.statistics) {
            const result = statistic.calculate(
                players,
                matches,
                placements,
                competitions,
            );
            LeaderboardController.cache[statistic.name] = result;
        }
    }

    public static async getCategories(): Promise<{
        player: StatisticData<"player">[];
        country: StatisticData<"country">[];
        map: StatisticData<"map">[];
    }> {
        return {
            player: LeaderboardController.statistics
                .filter((stat) => stat.type === "player")
                .map((stat) => {
                    return {
                        name: stat.name,
                        hasMaps: stat.hasMaps ?? false,
                        mapOptional: stat.mapOptional ?? false,
                        secondaryFilter: stat.secondaryFilter,
                        type: "player",
                        explanatoryText: stat.explanatoryText,
                        defaultSecondaryFilter: stat.defaultSecondaryFilter,
                    };
                }),
            country: LeaderboardController.statistics
                .filter((stat) => stat.type === "country")
                .map((stat) => {
                    return {
                        name: stat.name,
                        hasMaps: stat.hasMaps ?? false,
                        mapOptional: stat.mapOptional ?? false,
                        secondaryFilter: stat.secondaryFilter,
                        type: "country",
                        explanatoryText: stat.explanatoryText,
                        defaultSecondaryFilter: stat.defaultSecondaryFilter,
                    };
                }),
            map: LeaderboardController.statistics
                .filter((stat) => stat.type === "map")
                .map((stat) => {
                    return {
                        name: stat.name,
                        hasMaps: false,
                        mapOptional: false,
                        secondaryFilter: stat.secondaryFilter,
                        type: "map",
                        explanatoryText: stat.explanatoryText,
                        defaultSecondaryFilter: stat.defaultSecondaryFilter,
                    };
                }),
        };
    }

    public static async getEntries(
        category: string,
        map?: HitmanMap | OptionalMap,
    ): Promise<LeaderboardEntry[]> {
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
            } else if (map === OptionalMap.NO_MAP) {
                return (
                    LeaderboardController.cache[category] as Record<
                        HitmanMap | OptionalMap,
                        LeaderboardEntry[]
                    >
                )[OptionalMap.NO_MAP];
            } else {
                return (
                    LeaderboardController.cache[category] as Record<
                        HitmanMap,
                        LeaderboardEntry[]
                    >
                )[map];
            }
        } else {
            return LeaderboardController.cache[category] as LeaderboardEntry[];
        }
    }
}

@EventSubscriber()
export class LeaderboardDatabaseListener implements EntitySubscriberInterface {
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
                entity instanceof CompetitionPlacement ||
                entity instanceof Competition ||
                entity instanceof PlayedMap
            )
        ) {
            return;
        }

        if (this.invalidationTimer != null) {
            clearTimeout(this.invalidationTimer);
        }

        this.invalidationTimer = setTimeout(this.timerExpiry, 10000);
    }

    private timerExpiry() {
        void LeaderboardController.recalculate();
        clearTimeout(this.invalidationTimer!);
        this.invalidationTimer = null;
    }
}
