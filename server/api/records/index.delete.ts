import { AuthController } from "~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~/server/model/Record";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const query = getQuery(event);

    if (
        !(await AuthController.isAuthenticated(
            event.context.session.user,
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
