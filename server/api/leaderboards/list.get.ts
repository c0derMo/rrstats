import type { StatisticData } from "~/utils/interfaces/StatisticData";
import LeaderboardController from "../../controller/LeaderboardController";

export default defineEventHandler<
    Promise<{
        player: StatisticData<"player">[];
        country: StatisticData<"country">[];
        map: StatisticData<"map">[];
    }>
>(() => {
    return LeaderboardController.getCategories();
});
