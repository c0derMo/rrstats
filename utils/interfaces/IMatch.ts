import { HitmanMap } from '../mapUtils';

export type IMatch = {
    uuid: string;
    hitmapsMatchId: string;
    timestamp: number;

    playerOne: string;
    playerTwo: string;

    playerOneScore: number;
    playerTwoScore: number;

    competition: string;
    round: string;
    platform?: string;

    playedMaps: RRMap[];
    bannedMaps: RRBannedMap[];

    shoutcasters?: string[];
    vodLink?: string;
}

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
    map: HitmanMap,
    picked: ChoosingPlayer,
}

export interface RRMap {
    map: HitmanMap,
    picked: ChoosingPlayer,
    winner: WinningPlayer,
    forfeit?: boolean,
    spin?: Spin,
    startedTimestamp: number,
    endedTimestamp: number,
    timeAccurate?: boolean,
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
            selectedVariant: string;
        };
        disguise: {
            name: string;
            tileUrl: string;
        };
        complications: {
            name: string;
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