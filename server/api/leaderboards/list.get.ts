import LeaderboardController from "../../controller/LeaderboardController";

export default defineEventHandler(() => {
    return LeaderboardController.getCategories();
});
