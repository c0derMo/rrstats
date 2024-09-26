export type AccoladeResponse = Promise<string>;

export type MapResponse = Promise<{
    map: string;
    time: number;
    players: string[];
    competitions: string[];
}>;

export type PlayerResponse = Promise<FrozenExtendedMatch[]>;

export type StatisticsReponse = Promise<{
    winrate: number;
    mapWinrate: number;
    bestPlacement: number | undefined;
    winTieLoss: {
        w: number;
        t: number;
        l: number;
    };
    debutMatch: FrozenExtendedMatch | null;
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
    mapPBs: { match: FrozenExtendedMatch | null; map: number }[];
}>;

type FrozenExtendedMatch = {
    timestamp: number;
    playerOne: string;
    playerTwo: string;
    playerOneDiscord: string;
    playerTwoDiscord: string;
    competition: string;
    round: string;
    platform?: string;
    playedMaps: {
        map: number;
        picked: number;
        winner: number;
        forfeit?: boolean;
        spin?: FrozenSpin;
        timeTaken: number;
    }[];
    bannedMaps: {
        map: number;
        picked: number;
    }[];
};

type FrozenSpin = {
    mission: {
        slug: string;
        publicIdPrefix: number;
        targets: {
            name: string;
            tileUrl: string;
        }[];
    };
    targetConditions: {
        target: {
            name: string;
            tileUrl: string;
        };
        killMethod: {
            name: string;
            tileUrl: string;
            selectedVariant: string | null;
        };
        disguise: {
            name: string;
            tileUrl: string;
        };
        complications: {
            name: string;
            description: string;
            tileUrl: string;
        }[];
    }[];
    additionalObjectives: {
        objective: {
            name: string;
            tileUrl: string;
        };
        completionMethod: {
            name: string;
            tileUrl: string;
        };
        disguise: {
            name: string;
            tileUrl: string;
        };
    }[];
};
