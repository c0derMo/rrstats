export type ICompetition = {
    tag: string;
    name: string;

    officialCompetition: boolean;
    startingTimestamp: number;

    hitmapsStatsUrl?: string;
    hitmapsSlug?: string;
    updateWithHitmaps?: boolean

    backgroundImage?: string;
}