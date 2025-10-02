import { AuthController } from "~~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~~/server/model/Record";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        timestamp: number;
        record?: GenericRecordType;
        map?: number;
    }>(event);
    const query = getQuery<{
        type?: "generic" | "map";
    }>(event);
    const session = await AuthController.useSession(event);

    if (
        !(await AuthController.isAuthenticated(
            session.data.discordId,
            IPermission.EDIT_RECORDS,
        ))
    ) {
        throw createError({
            statusCode: 403,
        });
    }

    if (
        query.type === undefined ||
        (query.type !== "generic" && query.type !== "map")
    ) {
        throw createError({
            statusCode: 400,
            statusMessage: "Record type must be 'generic' or 'map'",
        });
    }

    if (query.type === "generic") {
        if (body.timestamp == null || body.record == null) {
            throw createError({
                statusCode: 400,
                statusMessage: "body must contain timestamp and record",
            });
        }
        const toRemove = await GenericRecord.findOneBy({
            timestamp: body.timestamp,
            record: body.record,
        });
        if (toRemove != null) {
            await toRemove.remove();
        }
    }
    if (query.type === "map") {
        if (body.timestamp == null || body.map == null) {
            throw createError({
                statusCode: 400,
                statusMessage: "body must contain timestamp and map",
            });
        }
        const toRemove = await MapRecord.findOneBy({
            timestamp: body.timestamp,
            map: body.map,
        });
        if (toRemove != null) {
            await toRemove.remove();
        }
    }
});
