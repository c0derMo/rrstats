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
    order: number;
    value: number;
}

export type LeaderboardColumnDefinition = {
    name: string;
    type: LeaderboardColumnType;
    colored?: boolean;
    filterable?: LeaderboardFilterType;
    defaultFilter?: unknown;
    serverSideFilter?: boolean;
    searchable?: boolean;
    sortable?: boolean;
}

export enum LeaderboardFilterType {
    TEXT = 'text',
    NUMERIC = 'numeric',
    MAP = 'map',
    MAP_OPTIONAL = 'map_optional',
    COMPETITION_RANGE = 'competition_range',
}

export enum LeaderboardColumnType {
    TEXT = 'text',
    PLAYER_NAME = 'player',
    PLACEMENT_TAG = 'placement_tag',
    IMAGE = 'image',
    MAP = 'map',
    HIDDEN = 'hidden',
    PERCENTAGE = 'percentage',
}

export type LeaderboardTableDefinition = {
    name: string;
    category: 'player' | 'country' | 'map';
    subcategory?: string;
    explanatoryText?: string;
    columns: LeaderboardColumnDefinition[];
}