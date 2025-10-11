import { Player } from "../model/Player";
import { Match } from "../model/Match";
import { Competition, CompetitionPlacement } from "../model/Competition";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
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
import consola from "consola";
import { PlayedMap } from "../model/PlayedMap";
import { PlayerTitlesWon } from "./leaderboardStatistics/player/TitlesWon";
import { PlayerAchievements } from "./leaderboardStatistics/player/Achievements";
import { isReady } from "../readyListener";
import { Achievement } from "../model/Achievement";

interface GenericLeaderboardStatistic<T extends string, R>
    extends StatisticData<T> {
    basedOn: (
        | "player"
        | "match"
        | "map"
        | "comp"
        | "placement"
        | "achievement"
    )[];
    calculate: () =>
        | Promise<Record<HitmanMap, R[]>>
        | Promise<Record<HitmanMap | OptionalMap, R[]>>
        | Promise<R[]>;
}

export type LeaderboardPlayerStatistic = GenericLeaderboardStatistic<
    "player",
    LeaderboardPlayerEntry
>;
export type LeaderboardCountryStatistic = GenericLeaderboardStatistic<
    "country",
    LeaderboardCountryEntry
>;
export type LeaderboardMapStatistic = GenericLeaderboardStatistic<
    "map",
    LeaderboardMapEntry
>;

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
    private static cache: Map<
        string,
        | LeaderboardPlayerEntry[]
        | LeaderboardCountryEntry[]
        | LeaderboardMapEntry[]
        | Record<HitmanMap, LeaderboardEntry[]>
        | Record<HitmanMap | OptionalMap, LeaderboardEntry[]>
    > = new Map();

    private static readonly statistics: LeaderboardStatistic[] = [
        new PlayerWinrate(),
        new PlayerMapWinrate(),
        new PlayerRRAppearances(),
        new PlayerRRWCAppearances(),
        new PlayerAveragePlacement(),
        new PlayerGFAppearances(),
        new PlayerTitlesWon(),
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
        new PlayerAchievements(),
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

    public static clearCache(
        type: "player" | "match" | "map" | "comp" | "placement" | "achievement",
    ) {
        let count = 0;
        for (const statistic of LeaderboardController.statistics) {
            if (statistic.basedOn.includes(type)) {
                count++;
                LeaderboardController.cache.delete(statistic.name);
            }
        }
        logger.log("Cleaned %d statistics with %s type.", count, type);
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

    @Log("LeaderboardController.getEntries", true)
    public static async getEntries(
        category: string,
        map?: HitmanMap | OptionalMap,
    ): Promise<LeaderboardEntry[]> {
        const statistic = LeaderboardController.statistics.find(
            (stat) => stat.name === category,
        );
        if (statistic == null) {
            return [];
        }

        if (!LeaderboardController.cache.has(category)) {
            LeaderboardController.cache.set(
                category,
                await statistic.calculate(),
            );
        }

        if (statistic.hasMaps) {
            if (map == null) {
                return [];
            } else if (map === OptionalMap.NO_MAP) {
                return (
                    LeaderboardController.cache.get(category) as Record<
                        HitmanMap | OptionalMap,
                        LeaderboardEntry[]
                    >
                )[OptionalMap.NO_MAP];
            } else {
                return (
                    LeaderboardController.cache.get(category) as Record<
                        HitmanMap,
                        LeaderboardEntry[]
                    >
                )[map];
            }
        } else {
            return LeaderboardController.cache.get(
                category,
            ) as LeaderboardEntry[];
        }
    }
}

@EventSubscriber()
export class LeaderboardDatabaseListener implements EntitySubscriberInterface {
    private readonly settings = {
        maxWait: 10000,
        checkInterval: 100,
        inactivityWait: 2000,
    };
    private readonly clearPlayer = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("player"),
        this.settings,
    );
    private readonly clearMatch = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("match"),
        this.settings,
    );
    private readonly clearMap = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("map"),
        this.settings,
    );
    private readonly clearComp = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("comp"),
        this.settings,
    );
    private readonly clearPlacement = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("placement"),
        this.settings,
    );
    private readonly clearAchievements = new DebouncedInvalidationFunction(
        () => LeaderboardController.clearCache("achievement"),
        this.settings,
    );

    afterInsert(event: InsertEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    afterUpdate(event: UpdateEvent<unknown>): void {
        this.invalidateLeaderboard(event.entity);
    }

    private invalidateLeaderboard(entity: unknown) {
        if (!isReady()) {
            return;
        }

        if (entity instanceof Player) {
            this.clearPlayer.call();
        }
        if (entity instanceof Match) {
            this.clearMatch.call();
        }
        if (entity instanceof PlayedMap) {
            this.clearMap.call();
        }
        if (entity instanceof Competition) {
            this.clearComp.call();
        }
        if (entity instanceof CompetitionPlacement) {
            this.clearPlacement.call();
        }
        if (entity instanceof Achievement) {
            this.clearAchievements.call();
        }
    }
}
