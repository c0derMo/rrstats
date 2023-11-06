import { Competition } from "~/server/model/Competition";

export default defineEventHandler(async (event) => {
    const rawCompetitions = await Competition.find({ select: ['backgroundImage', 'name', 'officialCompetition', 'tag'] });

    return rawCompetitions;
});