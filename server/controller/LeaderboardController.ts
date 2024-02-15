import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";
import { IMatch } from "~/utils/interfaces/IMatch";
import { IPlayer } from "~/utils/interfaces/IPlayer";
import {
    LeaderboardCountryEntry,
    LeaderboardPlayerEntry,
} from "~/utils/interfaces/LeaderboardEntry";
import { Player } from "../model/Player";
import { Match } from "../model/Match";
import { CompetitionPlacement } from "../model/Competition";
import { HitmanMap } from "~/utils/mapUtils";
import { PlayerWinrate } from "./leaderboardStatistics/PlayerWinrate";
import { PlayerMapWinrate } from "./leaderboardStatistics/PlayerMapWinrate";
import { CountryPlayers } from "./leaderboardStatistics/CountryPlayers";

export interface LeaderboardPlayerStatistic {
    name: string;
    type: "player";
    hasMaps: boolean;
    secondaryFilter?: string;
    calculate: (
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ) => LeaderboardPlayerEntry[] | Record<HitmanMap, LeaderboardPlayerEntry[]>;
}

export interface LeaderboardCountryStatistic {
    name: string;
    type: "country";
    hasMaps: boolean;
    secondaryFilter?: string;
    calculate: (
        players: IPlayer[],
        matches: IMatch[],
        placements: ICompetitionPlacement[],
    ) =>
        | LeaderboardCountryEntry[]
        | Record<HitmanMap, LeaderboardCountryEntry[]>;
}

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

        new CountryPlayers(),
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
        const placements = await CompetitionPlacement.find();

        for (const statistic of LeaderboardController.statistics) {
            const result = statistic.calculate(players, matches, placements);
            LeaderboardController.cache[statistic.name] = result;
        }
    }

    public static async getCategories(): Promise<{
        player: {
            name: string;
            hasMaps: boolean;
            type: "player";
            secondaryFilter?: string;
        }[];
        country: {
            name: string;
            hasMaps: boolean;
            type: "country";
            secondaryFilter?: string;
        }[];
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
                    };
                }),
        };
    }

    public static async getEntries(
        category: string,
        map?: HitmanMap,
    ): Promise<LeaderboardPlayerEntry[] | LeaderboardCountryEntry[]> {
        if (Object.keys(LeaderboardController.cache).length <= 0) {
            await LeaderboardController.recalculate(); // TODO: Remove this again reee
        }
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
