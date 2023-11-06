export type IPlayer = {
    uuid: string;

    primaryName: string;
    alternativeNames: string[];

    discordId?: string;
    
    title?: string;
    hasCustomTitle?: boolean;

    excludedFromSearch?: boolean;
}