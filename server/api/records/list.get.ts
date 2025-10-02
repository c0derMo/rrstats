import { AuthController } from "~~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~~/server/model/Record";

export default defineEventHandler<
    Promise<{ genericRecords: IGenericRecord[]; mapRecords: IMapRecord[] }>
>(async (event) => {
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

    const genericRecords = await GenericRecord.find({
        order: { timestamp: "DESC" },
    });
    const mapRecords = await MapRecord.find({ order: { timestamp: "DESC" } });

    return {
        genericRecords,
        mapRecords,
    };
});
