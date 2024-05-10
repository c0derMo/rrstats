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
