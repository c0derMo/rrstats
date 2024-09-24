import { Competition } from "../model/Competition";
import { Match } from "../model/Match";
import { Player } from "../model/Player";
import { GenericRecord, MapRecord } from "../model/Record";

export default defineEventHandler<
    Promise<{
        matches: number;
        competitions: number;
        officialCompetitions: number;
        players: number;
        genericRecords: number;
        mapRecords: number;
    }>
>(async () => {
    const matches = await Match.count();
    const competitions = await Competition.count();
    const officialCompetitions = await Competition.countBy({
        officialCompetition: true,
    });
    const players = await Player.count();
    const genericRecords = await GenericRecord.count();
    const mapRecords = await MapRecord.count();

    return {
        matches,
        competitions,
        officialCompetitions,
        players,
        genericRecords,
        mapRecords,
    };
});
