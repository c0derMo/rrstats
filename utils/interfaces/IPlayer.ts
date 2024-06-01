import { IMatch } from "./IMatch";

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
    };
}
