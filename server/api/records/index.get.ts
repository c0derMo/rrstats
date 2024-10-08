import { In } from "typeorm";
import { Match } from "~/server/model/Match";
import { GenericRecord, MapRecord } from "~/server/model/Record";
import type { IMatch } from "~/utils/interfaces/IMatch";
import type {
    GenericRecordType,
    IGenericRecord,
    IMapRecord,
} from "~/utils/interfaces/IRecord";
import type { HitmanMap } from "~/utils/mapUtils";

export default defineEventHandler<
    Promise<{
        maps: IMapRecord[];
        generic: IGenericRecord[];
        matches: Record<string, IMatch>;
    }>
>(async () => {
    const genericRecordTypes = await GenericRecord.find({ select: ["record"] });
    const mapsWithRecords = await MapRecord.find({ select: ["map"] });

    const genericRecords: IGenericRecord[] = [];
    const mapRecords: IMapRecord[] = [];
    const queriedTypes: Partial<Record<GenericRecordType, boolean>> = {};
    const queriedMaps: Partial<Record<HitmanMap, boolean>> = {};

    for (const genericRecordType of genericRecordTypes) {
        if (queriedTypes[genericRecordType.record] !== true) {
            const genericRecord = await GenericRecord.findOneOrFail({
                where: { record: genericRecordType.record },
                order: { timestamp: "DESC" },
                select: ["time"],
            });
            const allGenericRecordsWithTime = await GenericRecord.find({
                where: {
                    record: genericRecordType.record,
                    time: genericRecord.time,
                },
            });

            genericRecords.push(...allGenericRecordsWithTime);
            queriedTypes[genericRecordType.record] = true;
        }
    }
    for (const mapWithRecord of mapsWithRecords) {
        if (queriedMaps[mapWithRecord.map] !== true) {
            const mapRecord = await MapRecord.findOneOrFail({
                where: { map: mapWithRecord.map },
                order: { timestamp: "DESC" },
                select: ["time"],
            });
            const allMapRecordsWithTime = await MapRecord.find({
                where: { map: mapWithRecord.map, time: mapRecord.time },
            });

            mapRecords.push(...allMapRecordsWithTime);
            queriedMaps[mapWithRecord.map] = true;
        }
    }

    // Query all related matches
    const matchUUIDs = genericRecords
        .map((r) => r.match)
        .concat(mapRecords.map((r) => r.match));
    const matchesRaw = await Match.findBy({ uuid: In(matchUUIDs) });
    const matchMap: Record<string, IMatch> = {};
    for (const match of matchesRaw) {
        matchMap[match.uuid] = match;
    }

    return {
        maps: mapRecords,
        generic: genericRecords,
        matches: matchMap,
    };
});
