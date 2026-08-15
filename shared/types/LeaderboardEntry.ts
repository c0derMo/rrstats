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

export type LeaderboardRow = {
    columns: Record<string, unknown>;
    expandableRows?: unknown[][];
    backgroundColor?: string;
    color?: string;
    value: unknown;
    order: number;
}

export type LeaderboardColumnDefinition = {
    name: string;
    type: LeaderboardColumnType;
    colored?: boolean;
}

export enum LeaderboardColumnType {
    TEXT = 'text',
    PLAYER_NAME = 'player',
    PLACEMENT_TAG = 'placement_tag',
    IMAGE = 'image',
}

export type LeaderboardTableDefinition = {
    name: string;
    explanatoryText?: string;
    columns: LeaderboardColumnDefinition[];
}