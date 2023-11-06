import { HitmanMap } from "../mapUtils";

export type IGenericRecord = {
    timestamp: number,
    record: GenericRecordType,

    players: string[],
    time: number,
    match: string,
    maps: Record<HitmanMap, number>,
}

export type IMapRecord = {
    timestamp: number,
    map: HitmanMap,

    player: string,
    time: number,
    match: string,
    mapIndex: number,
}

export enum GenericRecordType {
    SHORTEST_MATCH_2MAPS = "Shortest match with 2+ maps",
    LONGEST_DECIDER = "Longest decider"
}

const retiredRecords = [GenericRecordType.LONGEST_DECIDER]

export const isRetiredRecord = (type: GenericRecordType): boolean => {
    if (retiredRecords.includes(type)) {
        return true;
    }
    return false;
}