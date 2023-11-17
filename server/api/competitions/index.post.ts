import { AuthController } from "~/server/controller/AuthController";
import { Competition } from "~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!AuthController.isAuthenticated()) {
        throw createError({
            statusCode: 403
        });
    }
    
    const competition = new Competition();
    Object.assign(competition, body)
    await competition.save();
});