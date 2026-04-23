import { AuthController } from "~~/server/controller/AuthController";

export default defineEventHandler(async (event) => {
    const session = await AuthController.useSession(event);
    await session.clear();
    await sendRedirect(event, "/");
});
