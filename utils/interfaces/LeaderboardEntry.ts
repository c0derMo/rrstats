export type LeaderboardPlayerEntry = {
    player: string;
    sortingScore: number;
    displayScore: string;
    secondaryScore?: number;
};

export type LeaderboardCountryEntry = {
    country: string;
    countryCode: string;
    sortingScore: number;
    displayScore: string;
    players: LeaderboardPlayerEntry[];
    secondaryScore?: number;
};

export type LeaderboardMapEntry = {
    map: string;
    sortingScore: number;
    tournamentBreakdown: number[];
    secondaryScore?: number;
};
