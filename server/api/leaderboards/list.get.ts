import LeaderboardController, {
    type StatisticData,
} from "../../controller/LeaderboardController";

export default defineEventHandler<
    Promise<{
        player: StatisticData<"player">[];
        country: StatisticData<"country">[];
        map: StatisticData<"map">[];
    }>
>(() => {
    return LeaderboardController.getCategories();
});
