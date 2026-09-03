import LeaderboardController from "../../controller/LeaderboardController";

export default defineEventHandler<Promise<LeaderboardRow[]>>(async (event) => {
    const query = getQuery<{
        category: string;
        filters: string;
    }>(event);

    const category = decodeURIComponent(query.category);
    const filters = JSON.parse(query.filters);

    return await LeaderboardController.getEntries(category, filters);
});
