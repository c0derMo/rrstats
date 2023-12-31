import { AuthController } from "~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~/server/model/Record";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const query = getQuery(event);

    if (!(await AuthController.isAuthenticated(event.context.session.user, IPermission.EDIT_RECORDS))) {
        throw createError({
            statusCode: 403,
        });
    }

    if (query.type === undefined || (query.type !== "generic" && query.type !== "map")) {
        throw createError({
            statusCode: 400,
            statusMessage: "Record type must be 'generic' or 'map'"
        });
    }

    if (query.type === "generic") {
        const genericRecord = new GenericRecord();
        Object.assign(genericRecord, body);
        await genericRecord.save();
    } else if (query.type === "map") {
        const mapRecord = new MapRecord();
        Object.assign(mapRecord, body);
        await mapRecord.save();
    }
});