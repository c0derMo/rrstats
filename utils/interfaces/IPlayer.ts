import type { IMatch } from "./IMatch";

export type IPlayer = {
    uuid: string;

    primaryName: string;
    alternativeNames: string[];

    discordId?: string | null;
    nationality?: string | null;

    title?: string | null;
    hasCustomTitle?: boolean;

    accolade: string;

    excludedFromSearch?: boolean;
};

export type IPlayerStatistics = {
    winrate: number;
    mapWinrate: number;
    bestPlacement: number | undefined;
    winTieLoss: {
        w: number;
        t: number;
        l: number;
    };
    debutMatch: IMatch | null;
    matchCount: number;
    mapCount: number;
    officialCompetitionCount: number;
    averagePlacement: number | undefined;
    competitionsWon: number;
    mapsPicked: number[];
    mapsPlayed: number[];
    mapsWon: number[];
    mapsBanned: number[];
    perMapWinrate: number[];
    mapPBs: { match: IMatch | null; map: number }[];
    h2hVsOpponent?: { w: number; t: number; l: number };
};

export function emptyStatistics(): IPlayerStatistics {
    return {
        winrate: 0,
        mapWinrate: 0,
        bestPlacement: undefined,
        winTieLoss: {
            w: 0,
            t: 0,
            l: 0,
        },
        debutMatch: null,
        matchCount: 0,
        mapCount: 0,
        officialCompetitionCount: 0,
        averagePlacement: undefined,
        competitionsWon: 0,
        mapsPicked: getAllMaps().map(() => 0),
        mapsPlayed: getAllMaps().map(() => 0),
        mapsWon: getAllMaps().map(() => 0),
        mapsBanned: getAllMaps().map(() => 0),
        perMapWinrate: getAllMaps().map(() => 0),
        mapPBs: getAllMaps().map(() => {
            return { match: null, map: -1 };
        }),
    };
}
