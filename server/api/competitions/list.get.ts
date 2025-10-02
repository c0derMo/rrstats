import { Competition } from "~~/server/model/Competition";

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
