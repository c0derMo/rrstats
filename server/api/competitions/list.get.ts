import { Competition } from "~~/server/model/Competition";

export default defineEventHandler<Promise<ICompetition[]>>(async () => {
    const rawCompetitions = await Competition.find({
        select: {
            backgroundImage: true,
            name: true,
            officialCompetition: true,
            tag: true,
            startingTimestamp: true,
        },
        order: { startingTimestamp: "DESC" },
    });

    return rawCompetitions;
});
