import { AuthController } from "~/server/controller/AuthController";
import { GenericRecord, MapRecord } from "~/server/model/Record";
import { IPermission } from "~/utils/interfaces/IUser";

export default defineEventHandler(async (event) => {
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

    const genericRecords = await GenericRecord.find();
    const mapRecords = await MapRecord.find();

    return {
        genericRecords,
        mapRecords,
    };
});