import LeaderboardController from "../../controller/LeaderboardController";

export default defineEventHandler<
    Promise<LeaderboardTableDefinition[]>
>(() => {
    return LeaderboardController.getCategories();
});
