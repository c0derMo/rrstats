import { HitmanMap } from "../mapUtils";

export type IGenericRecord = {
    timestamp: number;
    record: GenericRecordType;

    players: string[];
    time: number;
    match: string;
    maps: { map: HitmanMap; time: number }[];
};

export type IMapRecord = {
    timestamp: number;
    map: HitmanMap;

    player: string;
    time: number;
    match: string;
    mapIndex: number;
};

export enum GenericRecordType {
    LONGEST_REGULAR_MATCH = "Longest regular match",
    SHORTEST_MATCH_2MAPS = "Shortest match with 2+ maps",
    SHORTEST_MATCH_3MAPS = "Shortest match with 3+ maps",
    SHORTEST_MATCH_4MAPS = "Shortest match with 4+ maps",
    SHORTEST_MATCH_5MAPS = "Shortest match with 5+ maps",
    SHORTEST_MATCH_6MAPS = "Shortest match with 6+ maps",
    LONGEST_DECIDER = "Longest decider",
    SHORTEST_DECIDER = "Shortest decider",
}

const retiredRecords = [
    GenericRecordType.LONGEST_DECIDER,
    GenericRecordType.LONGEST_REGULAR_MATCH,
];

export const isRetiredRecord = (type: GenericRecordType): boolean => {
    if (retiredRecords.includes(type)) {
        return true;
    }
    return false;
};
