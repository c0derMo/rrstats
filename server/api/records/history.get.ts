import { GenericRecord, MapRecord } from "~/server/model/Record";
import type {
    GenericRecordType,
    IGenericRecord,
    IMapRecord,
} from "~/utils/interfaces/IRecord";

export default defineEventHandler<Promise<IMapRecord[] | IGenericRecord[]>>(
    async (event) => {
        const query = getQuery<{
            map?: number;
            generic?: GenericRecordType;
        }>(event);

        if (
            (query.map === undefined && query.generic === undefined) ||
            (query.map !== undefined && query.generic !== undefined)
        ) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    "exactly one of map or generic query parameter should be set",
            });
        }

        let records: IMapRecord[] | IGenericRecord[] = [];

        if (query.map !== undefined) {
            records = await MapRecord.find({
                where: { map: query.map },
                order: { timestamp: "ASC" },
            });
        }
        if (query.generic !== undefined) {
            records = await GenericRecord.find({
                where: { record: query.generic },
                order: { timestamp: "ASC" },
            });
        }

        if (records.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: "no records found",
            });
        }

        return records;
    },
);
