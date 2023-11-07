import { In } from 'typeorm';
import { Match } from '~/server/model/Match';
import { Player } from '~/server/model/Player';
import { GenericRecord, MapRecord } from '~/server/model/Record';
import { IMatch } from '~/utils/interfaces/IMatch';
import { GenericRecordType, IGenericRecord, IMapRecord } from '~/utils/interfaces/IRecord';
import { HitmanMap } from '~/utils/mapUtils';

export default defineEventHandler(async (event) => {
    const genericRecordTypes = await GenericRecord.find({ select: ['record'] })
    const mapsWithRecords = await MapRecord.find({ select: ['map'] })
    
    const genericRecords: IGenericRecord[] = [];
    const mapRecords: IMapRecord[] = [];
    const queriedTypes: Partial<Record<GenericRecordType, boolean>> = {}
    const queriedMaps: Partial<Record<HitmanMap, boolean>> = {}

    for (const genericRecordType of genericRecordTypes) {
        if (queriedTypes[genericRecordType.record] !== true) {
            const genericRecord = await GenericRecord.findOneOrFail({ where: { record: genericRecordType.record }, order: { time: 'ASC' }, select: ['time'] });
            const allGenericRecordsWithTime = await GenericRecord.find({ where: { record: genericRecordType.record, time: genericRecord.time } });

            genericRecords.push(...allGenericRecordsWithTime);
            queriedTypes[genericRecordType.record] = true
        }
    }
    for (const mapWithRecord of mapsWithRecords) {
        if (queriedMaps[mapWithRecord.map] !== true) {
            const mapRecord = await MapRecord.findOneOrFail({ where: { map: mapWithRecord.map }, order: { time: 'ASC' }, select: ['time'] });
            const allMapRecordsWithTime = await MapRecord.find({ where: { map: mapWithRecord.map, time: mapRecord.time } });

            mapRecords.push(...allMapRecordsWithTime);
            queriedMaps[mapWithRecord.map] = true
        }
    }

    // Query all related matches
    const matchUUIDs = genericRecords.map(r => r.match).concat(mapRecords.map(r => r.match));
    const matchesRaw = await Match.findBy({ uuid: In(matchUUIDs) });
    const matchMap: Record<string, IMatch> = {}
    for (const match of matchesRaw) {
        matchMap[match.uuid] = match
    }

    // Query all related players
    const playerUUIDs = matchesRaw.map(m => m.playerOne).concat(matchesRaw.map(m => m.playerTwo));
    const playersRaw = await Player.find({ where: { uuid: In(playerUUIDs) }, select: ['uuid', 'primaryName'] });
    const playerMap: Record<string, string> = {}
    for (const player of playersRaw) {
        playerMap[player.uuid] = player.primaryName
    }

    return {
        maps: mapRecords,
        generic: genericRecords,
        matches: matchMap,
        players: playerMap
    };
});
