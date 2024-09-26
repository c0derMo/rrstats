import { Competition } from "~/server/model/Competition";
import type { ICompetition } from "~/utils/interfaces/ICompetition";

export default defineEventHandler<Promise<ICompetition[]>>(async () => {
    const rawCompetitions = await Competition.find({
        select: [
            "backgroundImage",
            "name",
            "officialCompetition",
            "tag",
            "startingTimestamp",
        ],
        order: { startingTimestamp: "DESC" },
    });

    return rawCompetitions;
});
