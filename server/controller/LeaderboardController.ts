import { Player } from "../model/Player";
import { Match } from "../model/Match";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { PlayedMap } from "../model/PlayedMap";
import { Achievement } from "../model/Achievement";
import {
    type EntitySubscriberInterface,
    EventSubscriber,
    type InsertEvent,
    type UpdateEvent,
} from "typeorm";
import { isReady } from "../readyListener";
import consola from "consola";
import type { BaseLeaderboardStatistic } from "./leaderboardStatistics/BaseLeaderboardStatistic";

import { PlayerRouletteRankings } from "./leaderboardStatistics/player/RouletteRankings";
import { PlayerElo } from "./leaderboardStatistics/player/Elo";
import { PlayerMatchesPlayed } from "./leaderboardStatistics/player/MatchesPlayed";
import { PlayerMatchesWon } from "./leaderboardStatistics/player/MatchesWon";
import { PlayerWinrate } from "./leaderboardStatistics/player/Winrate";
import { PlayerMapsPlayed } from "./leaderboardStatistics/player/MapsPlayed";
import { PlayerMapsWon } from "./leaderboardStatistics/player/MapsWon";
import { PlayerMapWinrate } from "./leaderboardStatistics/player/MapWinrate";
import { PlayerWROwnMaps } from "./leaderboardStatistics/player/WROwnMaps";
import { PlayerWROpponentMaps } from "./leaderboardStatistics/player/WROpponentMaps";
import { PlayerWRRNGMaps } from "./leaderboardStatistics/player/WRRNGMaps";
import { PlayerSpecificMapPlayed } from "./leaderboardStatistics/player/SpecificMapPlayed";
import { PlayerSpecificMapWins } from "./leaderboardStatistics/player/SpecificMapWins";
import { PlayerSpecificMapWinrate } from "./leaderboardStatistics/player/SpecificMapWinrate";
import { PlayerMapPBTime } from "./leaderboardStatistics/player/MapPBTime";
import { PlayerRRAppearances } from "./leaderboardStatistics/player/RRAppearances";
import { PlayerRRWCAppearances } from "./leaderboardStatistics/player/RRWCAppearances";
import { PlayerTitlesWon } from "./leaderboardStatistics/player/TitlesWon";
import { PlayerGFAppearances } from "./leaderboardStatistics/player/GFAppearances";
import { PlayerMedalsWon } from "./leaderboardStatistics/player/MedalsWon";
import { PlayerBestPlacement } from "./leaderboardStatistics/player/BestPlacement";
import { PlayerAveragePlacement } from "./leaderboardStatistics/player/AveragePlacement";
import { PlayerMatchesWonInARow } from "./leaderboardStatistics/player/MatchesWonInARow";
import { PlayerMapsWonInARow } from "./leaderboardStatistics/player/MapsWonInARow";
import { PlayerSameMapWonInARow } from "./leaderboardStatistics/player/SameMapWonInARow";
import { PlayerSweeps } from "./leaderboardStatistics/player/Sweeps";
import { PlayerSweeps6 } from "./leaderboardStatistics/player/Sweeps6";
import { PlayerSweeps8 } from "./leaderboardStatistics/player/Sweeps8";
import { PlayerReverseSweeps } from "./leaderboardStatistics/player/ReverseSweeps";
import { PlayerMatchesCasted } from "./leaderboardStatistics/player/MatchesCasted";
import { PlayerAchievements } from "./leaderboardStatistics/player/Achievements";

import { CountryPlayers } from "./leaderboardStatistics/country/Players";
import { CountryMatches } from "./leaderboardStatistics/country/Matches";
import { CountryWins } from "./leaderboardStatistics/country/Wins";
import { CountryWinrate } from "./leaderboardStatistics/country/Winrate";
import { CountryTitles } from "./leaderboardStatistics/country/Titles";

import { MapPicked } from "./leaderboardStatistics/map/Picked";
import { MapBanned } from "./leaderboardStatistics/map/Banned";
import { MapPlayed } from "./leaderboardStatistics/map/Played";
import { MapRNG } from "./leaderboardStatistics/map/RNG";
import { MapAppearance } from "./leaderboardStatistics/map/Appearances";

const logger = consola.withTag("rrstats:leaderboards");

export default class LeaderboardController {
    static readonly statistics: BaseLeaderboardStatistic[] = [
        new PlayerRouletteRankings(),
        new PlayerElo(),

        new PlayerMatchesPlayed(),
        new PlayerMatchesWon(),
        new PlayerWinrate(),

        new PlayerMapsPlayed(),
        new PlayerMapsWon(),
        new PlayerMapWinrate(),
        new PlayerWROwnMaps(),
        new PlayerWROpponentMaps(),
        new PlayerWRRNGMaps(),
        new PlayerSpecificMapPlayed(),
        new PlayerSpecificMapWins(),
        new PlayerSpecificMapWinrate(),
        new PlayerMapPBTime(),

        new PlayerRRAppearances(),
        new PlayerRRWCAppearances(),
        new PlayerTitlesWon(),
        new PlayerGFAppearances(),
        new PlayerMedalsWon(),
        new PlayerBestPlacement(),
        new PlayerAveragePlacement(),

        new PlayerMatchesWonInARow(),
        new PlayerMapsWonInARow(),
        new PlayerSameMapWonInARow(),

        new PlayerSweeps(),
        new PlayerSweeps6(),
        new PlayerSweeps8(),
        new PlayerReverseSweeps(),

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
            if (statistic.basedOn().includes(type)) {
                count++;
                statistic.invalidate();
            }
        }
        logger.log("Cleaned %d statistics with %s type.", count, type);
    }

    public static async getCategories(): Promise<LeaderboardTableDefinition[]> {
        return LeaderboardController.statistics.map((stat) =>
            stat.getTableDefinition(),
        );
    }

    @Log("LeaderboardController.getEntries", true)
    public static async getEntries(
        category: string,
        serverSideFilters?: Record<string, unknown>,
    ): Promise<LeaderboardRow[]> {
        const statistic = LeaderboardController.statistics.find(
            (stat) => stat.getTableDefinition().name === category,
        );
        if (statistic == null) {
            return [];
        }

        return await statistic.get(serverSideFilters);
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
