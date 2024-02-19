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
