export interface IGroup {
    groupName: string;
    players: string[];
    advancingPlayers: number;
    positionOverrides: Record<number, string>;
}
export interface IGroupSettings {
    matchesBetweenPlayers: number;
    maxPointsPerMatch: number;
    groups: IGroup[];
}

export type ICompetition = {
    tag: string;
    name: string;

    officialCompetition: boolean;
    startingTimestamp: number;

    hitmapsStatsUrl?: string;
    hitmapsSlug?: string;
    updateWithHitmaps?: boolean;

    backgroundImage?: string;

    groupsConfig?: IGroupSettings;
};

export type ICompetitionPlacement = {
    player: string;
    bracket: string;
    competition: string;
    placement?: number;
};
