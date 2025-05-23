import type { HitmanMap } from "../mapUtils";

export type IMatch = {
    uuid: string;
    hitmapsMatchId: string;
    timestamp: number;

    playerOne: string;
    playerTwo: string;

    playerOneScore: number;
    playerTwoScore: number;

    annulated?: boolean;

    competition: string;
    round: string;
    platform?: string;

    playedMaps: RRMap[];
    bannedMaps: RRBannedMap[];

    notes?: string;

    eloChange: number[];

    shoutcasters?: string[];
    vodLink?: string[];
};

export enum ChoosingPlayer {
    RANDOM = 0,
    PLAYER_ONE = 1,
    PLAYER_TWO = 2,
}

export enum WinningPlayer {
    DRAW = 0,
    PLAYER_ONE = 1,
    PLAYER_TWO = 2,
}

export interface RRBannedMap {
    map: HitmanMap;
    picked: ChoosingPlayer;
}

export interface RRMap {
    map: HitmanMap;
    picked: ChoosingPlayer;
    winner: WinningPlayer;
    index: number;
    forfeit?: boolean;
    unscored?: boolean;
    spin?: Spin;
    timeTaken: number;
    notes?: string;
}

export interface IPlayedMap extends RRMap {
    match: IMatch;
}

export interface Spin {
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
}
