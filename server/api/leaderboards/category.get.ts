import type { HitmanMap } from "~/utils/mapUtils";
import LeaderboardController, {
    type LeaderboardEntry,
} from "../../controller/LeaderboardController";

export default defineEventHandler<Promise<LeaderboardEntry[]>>(
    async (event) => {
        const query = getQuery<{
            category: string;
            map: HitmanMap;
        }>(event);

        const category = decodeURIComponent(query.category);

        return await LeaderboardController.getEntries(category, query.map);
    },
);
