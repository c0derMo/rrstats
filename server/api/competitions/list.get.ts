import { Competition } from "~/server/model/Competition";

export default defineEventHandler(async () => {
    const rawCompetitions = await Competition.find({
        select: [
            "backgroundImage",
            "name",
            "officialCompetition",
            "tag",
            "startingTimestamp",
        ],
    });

    return rawCompetitions;
});
