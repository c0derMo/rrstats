import { Like, MoreThan, Not } from "typeorm";
import { GenericRecord, MapRecord } from "~/server/model/Record";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if (query.player === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "player query must be set",
        });
    }

    const genericRecords = await GenericRecord.findBy({
        players: Like(`%${query.player}%`),
    });
    const mapRecords = await MapRecord.findBy({
        player: query.player as string,
    });

    const allRecords = [];
    for (const genericRecord of genericRecords) {
        const breakingRecord = await GenericRecord.findOne({
            where: {
                record: genericRecord.record,
                timestamp: MoreThan(genericRecord.timestamp),
                time: Not(genericRecord.time),
            },
            order: { timestamp: "ASC" },
            select: ["timestamp"],
        });
        allRecords.push({
            record: genericRecord.record,
            time: genericRecord.time,
            timestamp: genericRecord.timestamp,
            brokenAt: breakingRecord?.timestamp ?? -1,
        });
    }

    for (const mapRecord of mapRecords) {
        const breakingRecord = await MapRecord.findOne({
            where: {
                map: mapRecord.map,
                timestamp: MoreThan(mapRecord.timestamp),
                time: Not(mapRecord.time),
            },
            order: { timestamp: "ASC" },
            select: ["timestamp"],
        });
        allRecords.push({
            map: mapRecord.map,
            time: mapRecord.time,
            timestamp: mapRecord.timestamp,
            brokenAt: breakingRecord?.timestamp ?? -1,
        });
    }

    return allRecords;
});
