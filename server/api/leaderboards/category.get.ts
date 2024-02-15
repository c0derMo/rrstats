import LeaderboardController from "../../controller/LeaderboardController";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const category = decodeURIComponent(query.category as string);

    return await LeaderboardController.getEntries(category);
});
