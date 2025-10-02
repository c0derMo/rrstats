import { AuthController } from "~~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~~/server/model/Record";

export default defineEventHandler(async (event) => {
    const body = await readBody<IGenericRecord | IMapRecord>(event);
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
        const genericRecord = new GenericRecord();
        Object.assign(genericRecord, body);
        await genericRecord.save();
    } else if (query.type === "map") {
        const mapRecord = new MapRecord();
        Object.assign(mapRecord, body);
        await mapRecord.save();
    }
});
